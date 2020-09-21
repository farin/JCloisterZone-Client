import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid';

import camelCase from 'lodash/camelCase'


export default class GameServer {
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
      port: 37447
    })

    this.wss.on('connection', this.onConnection)

  }

  onConnection (ws) {
    ws.on('message', data => {
      const { type, payload } = JSON.parse(data)

      const handler = this[camelCase('handle_' + type)]
      if (handler) {
        handler(ws, payload)
      } else {
        console.error("Unknown handler for " + type)
      }
    })

    ws.send('something')
  }

  handleHello (ws, payload) {
    // const { appVersion, protocolVersion, nickname, clientId, secret } = payload
    ws.hello = payload
    ws.send({
      type: 'WELCOME',
      payload: {
        sessionId: uuidv4()
      }
    })
    ws.send({
      type: 'GAME',
      payload: this.game
    })
  }
}
