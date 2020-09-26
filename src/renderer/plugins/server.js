import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid';
import { remote } from 'electron'
import Vue from 'vue'

import camelCase from 'lodash/camelCase'
import sample from 'lodash/sample'

import { randomLong } from '@/utils/random'
import { ENGINE_MESSAGES } from '@/constants/messages'


export class GameServer {
  constructor (game) {
    this.game = {
      gameId: game.gameId,
      setup: game.setup,
      initialSeed: game.initialSeed || randomLong().toString(),
      replay: game.replay || [],
      gameAnnotations: game.gameAnnotations || {},
      slots: []
      // clockStart: 0,      
    }    
    this.status = 'OPEN'
    this.ownerSessionId = null    
    this.wss = null
  }

  async start (port) {
    return new Promise(resolve => {
      this.wss = new WebSocket.Server({
        port,
        clientTracking: true
      }, () => {
        console.log('Embedded server started.')
        resolve()
      })
      this.wss.on('connection', ws => this.onConnection(ws))
      
    })
  }

  async stop () {
    if (this.wss) {
      return new Promise(resolve => {
        this.wss.close(() => {          
          console.log('Embedded server stopped.')
          resolve()
        })
        this.wss = null
      })
    }
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
    ws.on('close', () => {
      this.game.slots.forEach(slot => {
        if (slot.sessionId === ws.sessionId) {
          this.broadcast({ 
            type: 'SLOT', 
            payload: { number: slot.number }, 
          })
        }
      })
      this.game.slots = this.game.slots.filter(slot => slot.sessionId !== ws.sessionId)
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
    this.game.slots.forEach(slot => {
      ws.send(JSON.stringify({ 
        type: 'SLOT', 
        payload: slot, 
      }))
    })
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
  let socket = null

  Vue.prototype.$server = {
    async start (game, port) {      
      await this.stop()
      gameServer = new GameServer(game)
      await gameServer.start(port)      
    },

    async stop () {      
      if (gameServer) {
        await gameServer.stop()
        gameServer = null        
      }      
    },

    setOwner (sessionId) {
      if (gameServer) {
        console.log(`Server owner is ${sessionId}`)
        gameServer.ownerSessionId = sessionId
      }
    }
  }

  Vue.prototype.$connection = {
    async connect (host, onMessage) {
      return new Promise((resolve, reject) => {
        const ws = new WebSocket('ws://' + host)
        ws.addEventListener('open', () => {
          resolve()
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

        ws.addEventListener('error', (e) => {
          socket = null
          reject(e)
        })

        ws.addEventListener('message', ev => {
          const msg = JSON.parse(ev.data)                
          onMessage(msg)        
        })

        ws.addEventListener('close', ev => {
          console.log(`Websocket connection closed. code: ${ev.code} reason: ${ev.reason}`)
          socket = null
        })

        socket = ws        
      })
    }, 
        
    disconnect () {
      if (socket) {
        socket.close()        
      }
    },

    send (message) {
      socket.send(JSON.stringify(message))
    },

    isConnectedOrConnecting () {
      return socket !== null
    }
  }
}
