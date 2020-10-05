import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid';
import Vue from 'vue'

import camelCase from 'lodash/camelCase'

import { getAppVersion } from '@/utils/version'
import { randomLong } from '@/utils/random'
import { ENGINE_MESSAGES } from '@/constants/messages'
import { CONSOLE_SERVER_COLOR } from '@/constants/logging'


export class GameServer {
  constructor (game, clientId, { engineVersion, appVersion }, app) {
    this.app = app // hack for now, read replay from game store
    this.engineVersion = engineVersion
    this.appVersion = appVersion
    this.game = {
      gameId: game.gameId,
      setup: game.setup,
      initialSeed: game.initialSeed || randomLong().toString(),
      replay: game.replay || null,
      gameAnnotations: game.gameAnnotations || {},
      slots: game.slots,
      owner: null // owner session
      // clockStart: 0,
    }
    this.order = 1
    this.status = game.replay ? 'loaded' : 'new'
    this.ownerClientId = clientId
    this.wss = null
    this.clients = null
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

    })
  }

  async stop () {
    if (this.wss) {
      return new Promise(resolve => {
        this.wss.close(() => {
          console.log('%c embedded server %c stopped', CONSOLE_SERVER_COLOR, '')
          resolve()
        })
        this.clients = null
        this.wss = null
      })
    }
  }

  onConnection (ws) {
    let helloExpected = true
    ws.on('message', async data => {
      const { type, payload } = JSON.parse(data)
      if (ENGINE_MESSAGES.has(type)) {
        if (this.status !== 'started') {
          this.send(ws, {type: 'ERR', code: 'illegal-game-state', message: "Game is not started" })
          return
        }
        this.handleEngineMessage(ws, type, payload)
      } else {
        if (helloExpected) {
          if (type === 'HELLO') {
            helloExpected = false
          } else {
            await this.send(ws, {type: 'ERR', code: 'unexpected-message', message: "Unexpected message" })
            ws.close()
            return
          }
        }
        const handler = this[camelCase('handle_' + type)]
        if (handler) {
          handler.call(this, ws, payload)
        } else {
          console.error("Unknown handler for " + type)
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

      const clientSlots = this.game.slots.filter(s => s.sessionId === ws.sessionId)
      clientSlots.forEach(slot => {
        slot.sessionId = null
        if (this.status !== 'started') {
          slot.clientId = null
        }
        this.broadcast({
          type: 'SLOT',
          payload: slot,
        })
      })
    })
  }

  async send(ws, msg) {
    return new Promise(resolve => {
      ws.send(JSON.stringify(msg), {}, resolve)
    })
  }

  async broadcast (msg) {
    const data = JSON.stringify(msg)
    return Promise.all(this.clients.map(client => {
      return new Promise(resolve => {
        client.send(data, {}, resolve)
      })
    }))
  }

  async handleHello (ws, payload) {
     const { name, clientId, secret } = payload
    const clientAlreadyConnected = this.clients.find(ws => ws.clientId === clientId)
    if (clientAlreadyConnected && clientAlreadyConnected.secret !== secret) {
      await this.send(ws, { type: 'ERR', code: 'wrong-secret', message: "Secret doesn't match" })
      ws.close()
      return
    }

    if (this.engineVersion !== payload.engineVersion) {
      await this.send(ws, { type: 'ERR', code: 'bad-version', message: `Incompatible versions. server: ${this.appVersion} / client: ${payload.appVersion}` })
      ws.close()
      return
    }

    if (this.status === 'started') {
      if (!this.game.slots.find(slot => slot.clientId === clientId && !slot.sessionId)) {
        await this.send(ws, {type: 'ERR', code: 'illegal-game-state', message: "Game already started" })
        ws.close()
        return
      }
    }

    console.log(`%c embedded server %c client ${clientId} connected`, CONSOLE_SERVER_COLOR, '')

    this.clients.push(ws)
    const sessionId = uuidv4()
    ws.sessionId = sessionId
    ws.clientId = clientId
    ws.secret = secret
    ws.name = name

    this.send(ws, {
      type: 'WELCOME',
      payload: {
        sessionId
      }
    })

    if (this.game.owner === null && ws.clientId === this.ownerClientId) {
      this.game.owner = ws.sessionId
    }

    let game = this.game
    if (this.status === 'started') {
      game = { ...game, replay: this.app.store.state.game.gameMessages, started: true }
    }

    // auto assign slots with matching clientId
    const assignedSlots = []
    this.game.slots.forEach(slot => {
      if (slot.clientId === ws.clientId && !slot.sessionId) {
        slot.sessionId = ws.sessionId
        assignedSlots.push(slot)
      }
    })

    this.send(ws, {
      type: 'GAME',
      payload: game
    })

    assignedSlots.forEach(slot => {
      this.broadcast({
        type: 'SLOT',
        payload: slot
      })
    })
  }

  async handleTakeSlot (ws, { number, name }) {
    if (this.status === 'started') {
      this.send(ws, {type: 'ERR', code: 'illegal-game-state', message: "Game already started" })
      return
    }

    const slot = this.game.slots.find(s => s.number === number)
    if (!slot) {
      this.send(ws, { type: 'ERR', code: 'bad-slot', message: "Slot doesn't exist" })
      return
    }
    if (slot.sessionId) {
      this.send(ws, { type: 'ERR', code: 'slot-occupied', message: "Slot is occupied" })
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
      payload: slot
    })
  }

  async handleUpdateSlot (ws, { number, name }) {
    if (this.status === 'started') {
      this.send(ws, {type: 'ERR', code: 'illegal-game-state', message: "Game already started" })
      return
    }

    const slot = this.game.slots.find(s => s.number === number)
    if (!slot) {
      this.send(ws, { type: 'ERR', code: 'bad-slot', message: "Slot doesn't exist" })
      return
    }
    if (slot.sessionId !== ws.sessionId) {
      this.send(ws, {type: 'ERR', code: 'slot-owner', message: 'Slot is not assigned to your session'})
      return
    }
    if (this.status === 'new') {
      this.send(ws, {type: 'ERR', code: 'slot-reaonlyr', message: "Can't update slot"})
      return
    }

    slot.name = name
    this.broadcast({
      type: 'SLOT',
      payload: slot,
    })
  }

  handleLeaveSlot (ws, { number }) {
    if (this.status === 'started') {
      this.send(ws, {type: 'ERR', code: 'illegal-game-state', message: "Game already started" })
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
        payload: slot,
      })
    }
  }

  handleStart (ws) {
    if (this.status === 'started') {
      this.send(ws, {type: 'ERR', code: 'illegal-game-state', message: "Game already started" })
      return
    }

    if (this.game.owner !== ws.sessionId) {
      this.send(ws, { type: 'ERR', code: 'game-owner', message: 'Not a game owner' })
      return
    }
    this.status = 'started'
    this.broadcast({
      type: 'START',
      payload: {}
    })
  }

  handleEngineMessage (ws, type, payload) {
    const salted = ['COMMIT', 'FLOCK_EXPAND_OR_SCORE'].includes(type) || (type === 'DEPLOY_MEEPLE' && payload.pointer.location === 'FLYING_MACHINE')
    if (salted) {
      payload = {
        ...payload,
        salt: randomLong().toString()
      }
    }
    this.broadcast({ type, payload })
  }
}

export default ({ app }, inject) => {
  let gameServer = null

  Vue.prototype.$server = {
    async start (game) {
      await this.stop()
      const { settings } = app.store.state
      const appVersion = getAppVersion()
      const engineVersion = app.store.state.engine.version
      gameServer = new GameServer(game, settings.clientId, {
        appVersion,
        engineVersion
      }, app)
      await gameServer.start(settings.port)
    },

    async stop () {
      if (gameServer) {
        await gameServer.stop()
        gameServer = null
      }
    }
  }
}
