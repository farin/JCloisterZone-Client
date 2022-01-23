import Vue from 'vue'
import { randomId, randomInt } from '@/utils/random'

import { getAppVersion } from '@/utils/version'
import { CONSOLE_CLIENT_COLOR } from '@/constants/logging'
import { NETWORK_PROTOCOL_COMPATIBILITY } from '@/constants/versions'
import { EventsBase } from '@/utils/events'

const isDev = process.env.NODE_ENV === 'development'
const HEARTBEAT_INTERVAL = 9 * 1000
const HEARTBEAT_TIMEOUT = 9 * 1000

class ConnectionPlugin extends EventsBase {
  constructor (app) {
    super()
    this.app = app
    this.ws = null
    this.recentlyUsedSourceHash = null
    this.pingTimeout = null
    this.pongTimeout = null

    this.callbacks = null
    this.connectCallbacks = null

    if (process.env.JCZ_NETWORK_DELAY) {
      this.debugDelay = process.env.JCZ_NETWORK_DELAY.split('-').map(bound => +bound)
      if (this.debugDelay.length === 1) {
        // make interval from it
        this.debugDelay.push(this.debugDelay[0])
      }
    }
  }

  heartbeat = () => {
    clearTimeout(this.pingTimeout)
    clearTimeout(this.pongTimeout)

    this.pingTimeout = setTimeout(() => {
      this.pingTimeout = null
      if (this.ws?.readyState === 1) {
        this.ws.send('') // send empty frame = app level ping
        this.pongTimeout = setTimeout(() => {
          console.log('heartbeat timeout')
          this.ws?.close(4001)
        }, HEARTBEAT_TIMEOUT)
      }
    }, HEARTBEAT_INTERVAL)
  }

  onOpen () {
    console.log('%c client %c connected to ' + this.ws.url, CONSOLE_CLIENT_COLOR, '')
    const appVersion = getAppVersion()
    const engineVersion = this.app.store.state.engine.version
    const { settings } = this.app.store.state
    this.ws.send(JSON.stringify({
      id: randomId(),
      type: 'HELLO',
      payload: {
        appVersion,
        engineVersion,
        protocolVersion: NETWORK_PROTOCOL_COMPATIBILITY,
        name: settings.nickname,
        clientId: settings.clientId,
        secret: settings.secret
      }
    }))
    this.heartbeat()
  }

  onMessage (ev) {
    this.heartbeat()
    if (ev.data === '') {
      if (isDev) {
        console.log('%c client %c received empty message (pong)', CONSOLE_CLIENT_COLOR, '')
      }
      return
    }

    const handle = () => {
      const msg = JSON.parse(ev.data)
      if (isDev) {
        console.log('%c client %c received message', CONSOLE_CLIENT_COLOR, '')
        console.debug(msg)
      }
      // console.debug(`%c client %c received ${msg.type}`, CONSOLE_CLIENT_COLOR, '')
      if (msg.type === 'ERR') {
        this.connectCallbacks?.reject(msg)
        this.emit('error', msg.payload)
        return
      }
      if (msg.type === 'WELCOME') {
        console.log('%c client %c session id assigned ' + msg.payload.sessionId, CONSOLE_CLIENT_COLOR, '')
        this.connectCallbacks?.resolve()
      }

      this.heartbeat()
      this.callbacks.onMessage(msg)
      this.emit('message', msg)
    }

    if (this.debugDelay) {
      setTimeout(() => {
        handle()
      }, randomInt(...this.debugDelay))
    } else {
      handle()
    }
  }

  // onError (err) {
  //   console.log(`%c client %c websocket error ${err.message}`, CONSOLE_CLIENT_COLOR, '')
  //   this.afterClose(4001, err)
  // }

  onClose (ev) {
    console.log(`%c client %c websocket closed  code: ${ev.code} reason: ${ev.reason}`, CONSOLE_CLIENT_COLOR, '')
    this.afterClose(this.connectCallbacks ? 1000 : ev.code, ev) // not connected yet, do not report 1006
  }

  afterClose (code, ev) {
    clearTimeout(this.pingTimeout)
    clearTimeout(this.pongTimeout)
    if (this.ws) {
      this.connectCallbacks?.reject(ev)
      this.emit('close', ev)

      this.callbacks?.onClose(code)
      this.callbacks = null
      this.ws = null
    }
  }

  terminate () {
    // close has 30 sec timeout, remove listeners and call onClose immediatelly
    if (this.ws) {
      this.ws.onpen = undefined
      this.ws.onmessage = undefined
      this.ws.onclose = undefined
      this.ws.close(4001)
      this.onClose(4001, null)
    }
  }

  // TODO use emitter instead callback
  async connect (host, { onMessage, onClose }) {
    this.callbacks = { onMessage, onClose }

    return new Promise((resolve, reject) => {
      console.log('%c client %c trying to connect to ' + host, CONSOLE_CLIENT_COLOR, '')

      this.connectCallbacks = {
        resolve: () => { this.connectCallbacks = null; resolve() },
        reject: err => { this.connectCallbacks = null; reject(err) }
      }

      this.ws = new WebSocket(host)
      this.ws.onopen = this.onOpen.bind(this)
      this.ws.onmessage = this.onMessage.bind(this)
      this.ws.onclose = this.onClose.bind(this)
    })
  }

  disconnect () {
    if (this.ws) {
      this.ws.close()
      this.recentlyUsedSourceHash = null
    }
  }

  send (message) {
    return new Promise((resolve, reject) => {
      // ignored messages when client is disconnected
      if (this.ws) {
        if (message.sourceHash) {
          if (message.sourceHash === this.recentlyUsedSourceHash) {
            // duplicate message
            return resolve()
          }

          // set protection for next 1s => do not send message with same origin during this time
          this.recentlyUsedSourceHash = message.sourceHash
          setTimeout(() => {
            if (this.recentlyUsedSourceHash === message.sourceHash) {
              this.recentlyUsedSourceHash = null
            }
          }, 1000)
        }
        if (!message.id) {
          message = { id: randomId(), ...message }
        }

        if (this.debugDelay) {
          setTimeout(() => {
            this.ws.send(JSON.stringify(message))
            resolve()
          }, randomInt(...this.debugDelay))
        } else {
          this.ws.send(JSON.stringify(message))
          resolve()
        }
      } else {
        reject(new Error('not connected'))
      }
    })
  }

  // isConnectedOrConnecting () {
  //   return this.ws !== null
  // }

  onNextSendError (handler) {
    const callbacks = {}
    callbacks.onError = err => {
      this.off('error', callbacks.onError)
      this.off('message', callbacks.onMessage)
      handler(err)
    }
    callbacks.onMessage = () => {
      this.off('error', callbacks.onError)
      this.off('message', callbacks.onMessage)
    }
    this.on('error', callbacks.onError)
    this.on('message', callbacks.onMessage)
  }
}

export default ({ app }, inject) => {
  Vue.prototype.$connection = new ConnectionPlugin(app)
}
