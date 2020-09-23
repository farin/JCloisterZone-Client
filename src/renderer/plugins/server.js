import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid';
import { remote } from 'electron'
import Vue from 'vue'
import EventEmitter from 'events'

import camelCase from 'lodash/camelCase'
import sample from 'lodash/sample'

const PORT = 37447


export class GameServer {
  constructor (gameSetup) {
    this.game = {
      gameId: uuidv4(),
      status: 'OPEN',
      gameSetup,
      slots: []
      // clockStart: 0,
      // initialSeed:
      // replay;
    }    

    this.wss = new WebSocket.Server({
      port: PORT,
      clientTracking: true
    })

    this.wss.on('connection', ws => this.onConnection(ws))
  }

  onConnection (ws) {
    ws.on('message', data => {
      const { type, payload } = JSON.parse(data)      
      const handler = this[camelCase('handle_' + type)]
      if (handler) {
        handler.call(this, ws, payload)
      } else {
        console.error("Unknown handler for " + type)
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

  handleLeaveSlot (ws, { number }) {
    const idx = this.game.slots.findIndex(s => s.number === number)
    if (idx !== -1) {
      this.game.slots.splice(idx, 1)
      this.broadcast({ 
        type: 'SLOT', 
        payload: { number }, 
      })
    }
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
        console.log("message received", msg)
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
