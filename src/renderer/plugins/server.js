import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid';
import { remote } from 'electron'
import Vue from 'vue'
import EventEmitter from 'events'

import camelCase from 'lodash/camelCase'
import sample from 'lodash/sample'

import { randomLong } from '@/utils/random'
import { ENGINE_MESSAGES } from '@/constants/messages'

const PORT = 37447


export class GameServer {
  constructor (gameSetup) {
    this.game = {
      gameId: uuidv4(),
      gameSetup,
      slots: []
      // clockStart: 0,
      // initialSeed:
      // replay;
    }    
    this.status = 'OPEN'
    this.ownerSessionId = null

    this.wss = new WebSocket.Server({
      port: PORT,
      clientTracking: true
    })

    this.wss.on('connection', ws => this.onConnection(ws))
  }

  onConnection (ws) {
    ws.on('message', data => {
      const { type, payload } = JSON.parse(data)            
      if (ENGINE_MESSAGES.has(type)) {
        if (this.status !== 'STARTED') {
          ws.send(JSON.stringify({type: 'ERR', payload: 'Game is not started'}))
          return
        }
        this.handleEngineMessage(ws, type, payload)                        
      } else {
        if (this.status !== 'OPEN') {
          ws.send(JSON.stringify({type: 'ERR', payload: 'Game is not open'}))
          return
        }
        const handler = this[camelCase('handle_' + type)]      
        if (handler) {
          handler.call(this, ws, payload)
        } else {
          console.error("Unknown handler for " + type)
        }
      }
    })
  }

  broadcast (msg) {
    const data = JSON.stringify(msg)
    for (let client of this.wss.clients) {
      client.send(data)
    }
  }

  handleHello (ws, payload) {
    // const { appVersion, protocolVersion, nickname, clientId, secret } = payload
    const sessionId = uuidv4()
    ws.sessionId = sessionId
    ws.clientId = payload.clientId
    ws.secret = payload.secret
    ws.name = payload.name    
    ws.send(JSON.stringify({
      type: 'WELCOME',
      payload: {
        sessionId
      }
    }))
    ws.send(JSON.stringify({
      type: 'GAME',
      payload: this.game
    }))
  }

  handleTakeSlot (ws, { number, name }) {
    const slot = { 
      number,
      name: name || ws.name || '',
      order: this.game.slots.length + 1,
      sessionId: ws.sessionId,
      clientId: ws.clientId
    }    
    this.game.slots.push(slot)
    this.broadcast({ 
      type: 'SLOT', 
      payload: slot, 
    })
  }

  handleUpdateSlot (ws, { number, name }) {
    const slot = this.game.slots.find(s => s.number === number)
    if (slot.sessionId !== ws.sessionId) {
      ws.send(JSON.stringify({type: 'ERR', payload: 'Slot is not assigned to your session'}))
      return 
    }
    slot.name = name
    this.broadcast({ 
      type: 'SLOT', 
      payload: slot, 
    })
  }

  handleLeaveSlot (ws, { number }) {
    const idx = this.game.slots.findIndex(s => s.number === number)
    const slot = this.game.slots[idx]
    if (slot.sessionId !== ws.sessionId) {
      ws.send(JSON.stringify({type: 'ERR', payload: 'Slot is not assigned to your session'}))
      return 
    }
    if (idx !== -1) {
      this.game.slots.splice(idx, 1)
      this.broadcast({ 
        type: 'SLOT', 
        payload: { number }, 
      })
    }
  }

  handleStart (ws) {
    if (this.ownerSessionId !== ws.sessionId) {
      ws.send(JSON.stringify({type: 'ERR', payload: 'Not a game owner'}))
      return 
    }
    this.status = 'STARTED'
    this.broadcast({ 
      type: 'START', 
      payload: { 
        seed: randomLong().toString()
      } 
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
  let socket = null

  Vue.prototype.$server = {
    start (gameSetup) {      
      gameServer = new GameServer(gameSetup)
    },

    stop () {
      if (gameServer) {
        gameServer.wss.close()
        gameServer = null
      }
    },

    setOwner (sessionId) {
      gameServer.ownerSessionId = sessionId
    }
  }

  Vue.prototype.$connection = {
    connect () {
      const emitter = new EventEmitter()
      const ws = new WebSocket('ws://localhost:' + PORT)
      ws.addEventListener('open', () => {
        console.log("Websocket connection opened")
        const appVersion = process.env.NODE_ENV === 'development' ? process.env.npm_package_version : remote.app.getVersion()
        const { settings } = app.store.state
        ws.send(JSON.stringify({ 
          type: 'HELLO',
          payload: {
            appVersion,
            protocolVersion: '5.0.0',
            name: sample(['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace', 'Oscar', 'Wendy']),            
            clientId: settings.clientId,
            secret: settings.secret
          }
        }))
      })

      ws.addEventListener('message', ev => {
        const msg = JSON.parse(ev.data)        
        emitter.emit('message', msg)        
      })

      socket = {
        ws, emitter
      }      
    }, 
    
    on (eventName, cb) {
      socket.emitter.on(eventName, cb)
    },

    off (eventName, cb) {
      socket.emitter.off(eventName, cb)
    },

    disconnect () {
      if (socket) {
        socket.close()
        socket = null
      }
    },

    send (message) {
      socket.ws.send(JSON.stringify(message))
    }
  }
}
