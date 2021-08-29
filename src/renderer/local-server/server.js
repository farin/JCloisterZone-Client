
import WebSocket from 'ws'

import camelCase from 'lodash/camelCase'
import shuffle from 'lodash/shuffle'
import isNil from 'lodash/isNil'

import { NETWORK_PROTOCOL_COMPATIBILITY } from '@/constants/versions'
import { randomId } from '@/utils/random'
import { ENGINE_MESSAGES } from '@/constants/messages'
import { CONSOLE_SERVER_COLOR } from '@/constants/logging'
import { HEARTBEAT_INTERVAL } from '@/constants/ws'

const isDev = process.env.NODE_ENV === 'development'

export default class GameServer {
  constructor (game, clientId, { engineVersion, appVersion }) {
    this.engineVersion = engineVersion
    this.appVersion = appVersion
    this.game = {
      gameId: game.gameId,
      originAppVersion: game.originAppVersion || appVersion,
      setup: game.setup,
      initialRandom: isNil(game.initialRandom) ? Math.random() : game.initialRandom,
      gameAnnotations: game.gameAnnotations || {},
      slots: game.slots,
      owner: null // owner session
    }
    this.order = 1
    this.status = game.replay ? 'loaded' : 'new'
    this.ownerClientId = clientId
    this.wss = null
    this.clients = null
    this.heartbeatInterval = null
    this.replay = game.replay || []
    this.initialClock = game.clock || 0
    this.receivedMessageIds = new Set()
    this.expectedParentId = null

    this.errorHandler = err => { console.error(err) }
  }

  dump () {
    return {
      ownerClientId: this.ownerClientId,
      gameStatus: this.status,
      initialClock: this.initialClock,
      connectedClients: this.clients?.map(ws => ws.clientId),
      receivedMessageIds: Array.from(this.receivedMessageIds),
      expectedParentId: this.expectedParentId,
      replay: this.replay,
      game: {
        gameId: this.game.gameId,
        initialRandom: this.game.initialRandom,
        setup: this.game.setup,
        gameAnnotation: this.game.gameAnnotation,
        slots: this.game.slots
      }
    }
  }

  on (event, callback) {
    if (event === 'error') {
      this.errorHandler = callback
    } else {
      console.warn('Unknown event type')
    }
  }

  async start (port) {
    return new Promise(resolve => {
      this.clients = []
      this.wss = new WebSocket.Server({
        port
      }, () => {
        console.log(`%c embedded server %c started (${this.status} game)`, CONSOLE_SERVER_COLOR, '')
        resolve()
      })
      this.wss.on('connection', ws => this.onConnection(ws))
      this.wss.on('error', err => {
        this.errorHandler(err)
      })

      this.heartbeatInterval = setInterval(() => {
        this.wss.clients.forEach(ws => {
          if (ws.isAlive === false) {
            ws.terminate()
            return
          }

          ws.isAlive = false
          ws.ping()
        })
      }, HEARTBEAT_INTERVAL)
    })
  }

  async stop () {
    if (this.wss) {
      return new Promise(resolve => {
        this.closing = resolve

        clearInterval(this.heartbeatInterval)
        this.clients.forEach(ws => {
          ws.close()
        })
        setTimeout(() => {
          // do force close if not resolved yet
          this._resolveClose()
        }, 2000)
      })
    }
  }

  onConnection (ws) {
    if (this.closing) {
      ws.terminate()
      return
    }

    ws.isAlive = true
    ws.on('pong', () => {
      ws.isAlive = true
    })

    let helloExpected = true
    ws.on('message', async data => {
      const message = JSON.parse(data)
      if (isDev) {
        console.log('%c embedded server %c received message', CONSOLE_SERVER_COLOR, '')
        console.log(message)
      }
      const { id, type } = message
      if (this.receivedMessageIds.has(id)) {
        console.warn(`Dropping already received message ${data}"`)
        return
      }
      this.receivedMessageIds.add(id)

      if (ENGINE_MESSAGES.has(type)) {
        if (this.status !== 'started') {
          this.send(ws, { type: 'ERR', code: 'illegal-game-state', message: 'Game is not started' })
          return
        }
        if (this.expectedParentId && message.parentId && this.expectedParentId !== message.parentId) {
          console.warn(`Wrong parent id ${data}"`)
          this.send(ws, this.createGameMessage())
          return
        }
        this.expectedParentId = message.id
        this.handleEngineMessage(ws, message)
      } else {
        if (helloExpected) {
          if (type === 'HELLO') {
            helloExpected = false
          } else {
            await this.send(ws, { type: 'ERR', code: 'unexpected-message', message: 'Unexpected message' })
            ws.close()
            return
          }
        }
        if (type === 'START') {
          this.expectedParentId = message.id
        }
        const handler = this[camelCase('handle_' + type)]
        if (handler) {
          handler.call(this, ws, message)
        } else {
          console.error('Unknown handler for ' + type)
        }
      }
    })
    ws.on('close', code => {
      console.log('%c embedded server %c websocket connection closed ' + code, CONSOLE_SERVER_COLOR, '')
      if (this.clients === null) {
        return
      }

      const idx = this.clients.indexOf(ws)
      if (idx !== -1) {
        this.clients.splice(idx, 1)
      }

      if (!this.closing) {
        const clientSlots = this.game.slots.filter(s => s.sessionId === ws.sessionId)
        clientSlots.forEach(slot => {
          slot.sessionId = null
          if (this.status !== 'started') {
            slot.clientId = null
          }
          this.broadcast({
            type: 'SLOT',
            payload: { ...slot, gameId: this.game.gameId }
          })
        })
      }

      if (this.closing && !this.clients.length) {
        this._resolveClose()
      }
    })
  }

  _resolveClose () {
    if (this.wss) {
      this.wss.close(() => {
        console.log('%c embedded server %c stopped', CONSOLE_SERVER_COLOR, '')
        this.closing()
        delete this.closing
      })
      this.clients = null
      this.wss = null
    }
  }

  async send (ws, msg) {
    if (!msg.id) {
      msg = { ...msg, id: randomId() }
    }
    return new Promise(resolve => {
      ws.send(JSON.stringify(msg), {}, resolve)
    })
  }

  async broadcast (msg) {
    if (!msg.id) {
      msg = { ...msg, id: randomId() }
    }
    const data = JSON.stringify(msg)
    return Promise.all(this.clients.map(client => {
      return new Promise(resolve => {
        client.send(data, {}, resolve)
      })
    }))
  }

  async handleHello (ws, { payload }) {
    const { name, clientId, secret } = payload
    const clientAlreadyConnected = this.clients.find(ws => ws.clientId === clientId)
    if (clientAlreadyConnected && clientAlreadyConnected.secret !== secret) {
      await this.send(ws, { type: 'ERR', code: 'wrong-secret', message: "Secret doesn't match" })
      ws.close()
      return
    }

    if (this.engineVersion !== payload.engineVersion) {
      if (this.appVersion === payload.appVersion) {
        await this.send(ws, { type: 'ERR', code: 'bad-version', message: `Incompatible engine versions. server engine ${this.engineVersion} / client engine ${payload.engineVersion})` })
      } else {
        await this.send(ws, { type: 'ERR', code: 'bad-version', message: `Incompatible versions. server ${this.appVersion} / client: ${payload.appVersion}` })
      }
      ws.close()
      return
    }
    if (NETWORK_PROTOCOL_COMPATIBILITY !== payload.protocolVersion) {
      await this.send(ws, { type: 'ERR', code: 'bad-version', message: `Incompatible versions. server ${this.appVersion} / client: ${payload.appVersion}` })
      ws.close()
      return
    }

    if (this.status === 'started') {
      if (!this.game.slots.find(slot => slot.clientId === clientId && !slot.sessionId)) {
        await this.send(ws, { type: 'ERR', code: 'illegal-game-state', message: 'Game is already started' })
        ws.close()
        return
      }
    }

    console.log(`%c embedded server %c client ${clientId} connected`, CONSOLE_SERVER_COLOR, '')

    this.clients.push(ws)
    const sessionId = randomId()
    ws.sessionId = sessionId
    ws.clientId = clientId
    ws.secret = secret
    ws.name = name

    this.send(ws, {
      type: 'WELCOME',
      payload: {
        sessionId,
        heartbeat: HEARTBEAT_INTERVAL
      }
    })

    if (this.game.owner === null && ws.clientId === this.ownerClientId) {
      this.game.owner = ws.sessionId
    }

    // create message before slot update
    const gameMessage = this.createGameMessage()

    // auto assign slots with matching clientId
    const assignedSlots = []
    this.game.slots.forEach(slot => {
      if (slot.clientId === ws.clientId && !slot.sessionId) {
        slot.sessionId = ws.sessionId
        assignedSlots.push(slot)
      }
    })

    this.send(ws, gameMessage)
    assignedSlots.forEach(slot => {
      this.broadcast({
        type: 'SLOT',
        payload: { ...slot, gameId: this.game.gameId }
      })
    })
  }

  createGameMessage () {
    const started = this.status === 'started'
    const game = {
      ...this.game,
      state: started ? 'R' : 'O',
      replay: this.status === 'new' ? null : this.replay
    }

    const msg = {
      type: 'GAME',
      payload: game
    }

    if (started) {
      msg.payload.started = (new Date(this.startedAt)).toISOString()
      msg.clock = Date.now() - this.startedAt
    }

    return msg
  }

  async handleSyncGame (ws) {
    if (this.status !== 'started') {
      this.send(ws, { type: 'ERR', code: 'illegal-game-state', message: 'Game not started' })
      return
    }
    this.send(ws, this.createGameMessage())
  }

  async handleTakeSlot (ws, { payload: { number, name } }) {
    if (this.status === 'started') {
      this.send(ws, { type: 'ERR', code: 'illegal-game-state', message: 'Game is already started' })
      return
    }

    const slot = this.game.slots.find(s => s.number === number)
    if (!slot) {
      this.send(ws, { type: 'ERR', code: 'bad-slot', message: "Slot doesn't exist" })
      return
    }
    if (slot.sessionId) {
      this.send(ws, { type: 'ERR', code: 'slot-occupied', message: 'Slot is occupied' })
      return
    }

    if (this.status === 'new') {
      slot.name = name || ws.name || ''
      slot.order = this.order++
    }
    slot.sessionId = ws.sessionId
    slot.clientId = ws.clientId
    this.broadcast({
      type: 'SLOT',
      payload: { ...slot, gameId: this.game.gameId }
    })
  }

  async handleUpdateSlot (ws, { payload: { number, name } }) {
    if (this.status === 'started') {
      this.send(ws, { type: 'ERR', code: 'illegal-game-state', message: 'Game is already started' })
      return
    }

    const slot = this.game.slots.find(s => s.number === number)
    if (!slot) {
      this.send(ws, { type: 'ERR', code: 'bad-slot', message: "Slot doesn't exist" })
      return
    }
    if (slot.sessionId !== ws.sessionId) {
      this.send(ws, { type: 'ERR', code: 'slot-owner', message: 'Slot is not assigned to your session' })
      return
    }
    if (this.status !== 'new') {
      this.send(ws, { type: 'ERR', code: 'slot-reaonly', message: "Can't update slot" })
      return
    }

    slot.name = name
    this.broadcast({
      type: 'SLOT',
      payload: { ...slot, gameId: this.game.gameId }
    })
  }

  handleLeaveSlot (ws, { payload: { number } }) {
    if (this.status === 'started') {
      this.send(ws, { type: 'ERR', code: 'illegal-game-state', message: 'Game is already started' })
      return
    }

    const idx = this.game.slots.findIndex(s => s.number === number)
    const slot = this.game.slots[idx]
    if (!slot) {
      this.send(ws, { type: 'ERR', code: 'bad-slot', message: "Slot doesn't exist" })
      return
    }
    if (slot.sessionId !== ws.sessionId) {
      this.send(ws, { type: 'ERR', code: 'slot-owner', message: 'Slot is not assigned to your session' })
      return
    }
    if (idx !== -1) {
      if (this.status === 'new') {
        slot.name = null
        slot.order = null
      }
      slot.sessionId = null
      slot.clientId = null
      this.broadcast({
        type: 'SLOT',
        payload: { ...slot, gameId: this.game.gameId }
      })
    }
  }

  handleStart (ws, message) {
    if (this.status === 'started') {
      this.send(ws, { type: 'ERR', code: 'illegal-game-state', message: 'Game is already started' })
      return
    }

    if (this.game.owner !== ws.sessionId) {
      this.send(ws, { type: 'ERR', code: 'game-owner', message: 'Not a game owner' })
      return
    }

    const payload = {}

    if (this.game.setup.options.randomizeSeating && this.status === 'new') {
      const slots = shuffle(this.game.slots.filter(s => s.order))
      const seating = {}
      slots.forEach((slot, idx) => {
        slot.order = idx + 1
        seating[slot.number] = slot.order
      })
      payload.seating = seating
    }

    this.status = 'started'
    this.startedAt = Date.now() - this.initialClock
    this.broadcast({
      id: message.id,
      type: 'START',
      payload,
      clock: this.initialClock
    })
  }

  handleGameOption (ws, message) {
    if (this.status === 'started') {
      this.send(ws, { type: 'ERR', code: 'illegal-game-state', message: 'Game is already started' })
      return
    }

    if (this.game.owner !== ws.sessionId) {
      this.send(ws, { type: 'ERR', code: 'game-owner', message: 'Not a game owner' })
      return
    }

    this.game.setup.options[message.payload.key] = message.payload.value
    this.broadcast(message)
  }

  handleEngineMessage (ws, { id, type, payload, player, sourceHash }) {
    const randomChanging = ['COMMIT', 'FLOCK_EXPAND_OR_SCORE'].includes(type) || (type === 'DEPLOY_MEEPLE' && payload.pointer.feature === 'FlyingMachine')
    if (randomChanging) {
      payload = {
        ...payload,
        random: Math.random()
      }
    }
    const msg = { id, type, payload, player, sourceHash, clock: Date.now() - this.startedAt }
    if (type === 'UNDO') {
      this.replay.pop()
    } else {
      this.replay.push(msg)
    }
    this.broadcast(msg)
  }
}
