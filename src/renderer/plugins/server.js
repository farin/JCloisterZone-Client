import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid';
import { remote } from 'electron'
import Vue from 'vue'

import camelCase from 'lodash/camelCase'

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
      port: PORT
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

  handleHello (ws, payload) {
    // const { appVersion, protocolVersion, nickname, clientId, secret } = payload
    ws.hello = payload
    ws.send(JSON.stringify({
      type: 'WELCOME',
      payload: {
        sessionId: uuidv4()
      }
    }))
    ws.send(JSON.stringify({
      type: 'GAME',
      payload: this.game
    }))
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
      socket = new WebSocket('ws://localhost:' + PORT);
      socket.addEventListener('open', () => {
        console.log("Websocket connection opened")
        const appVersion = process.env.NODE_ENV === 'development' ? process.env.npm_package_version : remote.app.getVersion()
        socket.send(JSON.stringify({ 
          type: 'HELLO',
          payload: {
            appVersion,
            protocolVersion: '5.0.0',
            nickname: 'Alice',
            clientId: app.store.state.settings.clientId,
            secret: ''
          }
        }))
      })

      socket.addEventListener('message', ev => {
        console.log("RCV", ev.data)
      })
    },

    dicconnect () {
      if (socket) {
        socket.close()
        socket = null
      }
    },

    send (message) {
      socket.send(JSON.stringify(message))
    }
  }
}
