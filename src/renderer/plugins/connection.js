import { EventEmitter } from 'events'

import WebSocket from 'ws'
import { remote } from 'electron'
import Vue from 'vue'

import sample from 'lodash/sample'
import { CONSOLE_CLIENT_COLOR } from '@/constants/logging'

const isDev = process.env.NODE_ENV === 'development'

class ConnectionPlugin {

  constructor (app) {
    this.app = app
    this.ws = null
    this.emitter = new EventEmitter()
  }

  // TODO use emitter instead callback
  async connect (host, { onMessage, onClose }) {
    let fulfilled = false
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('ws://' + host)
      this.ws.addEventListener('open', () => {
        console.log('%c client %c connected to ' + host, CONSOLE_CLIENT_COLOR, '')
        const appVersion = process.env.NODE_ENV === 'development' ? process.env.npm_package_version : remote.app.getVersion()
        const engineVersion = this.app.store.state.engine.version
        const { settings } = this.app.store.state
        this.ws.send(JSON.stringify({
          type: 'HELLO',
          payload: {
            appVersion,
            engineVersion,
            protocolVersion: '5.0.0',
            name: settings.nickname,
            clientId: settings.clientId,
            secret: settings.secret
          }
        }))
      })

      this.ws.addEventListener('error', e => {
        console.log(`%c client %c websocket error ${e.message}`, CONSOLE_CLIENT_COLOR, '')
        this.ws = null
        reject(e)
        onClose()
      })

      this.ws.addEventListener('message', ev => {
        const msg = JSON.parse(ev.data)
        if (isDev) {
          console.debug(msg)
        }
        // console.debug(`%c client %c received ${msg.type}`, CONSOLE_CLIENT_COLOR, '')
        if (msg.type === 'ERR') {
          if (!fulfilled) {
            fulfilled = true
            reject(msg)
          }
          this.emitter.emit('error', msg.payload)
          return
        }
        if (msg.type === 'WELCOME') {
          console.log('%c client %c received session id ' + msg.payload.sessionId, CONSOLE_CLIENT_COLOR, '')
          fulfilled = true
          resolve()
        }
        onMessage(msg)
        this.emitter.emit('message', msg)
      })

      this.ws.addEventListener('close', ev => {
        console.log(`%c client %c websocket closed  code: ${ev.code} reason: ${ev.reason}`, CONSOLE_CLIENT_COLOR, '')
        this.ws = null
        this.emitter.emit('close', ev)
        if (!fulfilled) {
          reject(ev)
        }
        onClose()
      })
    })
  }

  disconnect () {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send (message) {
    this.ws.send(JSON.stringify(message))
  }

  isConnectedOrConnecting () {
    return this.ws !== null
  }

  on (eventName, listener) {
    return this.emitter.on(eventName, listener)
  }

  once (eventName, listener) {
    return this.emitter.once(eventName, listener)
  }

  off (eventName, listener) {
    return this.emitter.off(eventName, listener)
  }
}

export default ({ app }, inject) => {
  Vue.prototype.$connection = new ConnectionPlugin(app)
}




