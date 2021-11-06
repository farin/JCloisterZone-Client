import Vue from 'vue'
import { randomId, randomInt } from '@/utils/random'

import { getAppVersion } from '@/utils/version'
import { CONSOLE_CLIENT_COLOR } from '@/constants/logging'
import { NETWORK_PROTOCOL_COMPATIBILITY } from '@/constants/versions'
import { EventsBase } from '@/utils/events'

const isDev = process.env.NODE_ENV === 'development'
const HEARTBEAT_INTERVAL = 10 * 1000
const HEARTBEAT_TIMEOUT = 10 * 1000

class ConnectionPlugin extends EventsBase {
  constructor (app) {
    super()
    this.app = app
    this.ws = null
    this.recentlyUsedSourceHash = null
    this.pingTimeout = null
    this.pongTimeout = null

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
      if (this.ws.readyState === 1) {
        this.ws.send('') // send empty frame = app level ping
        this.pongTimeout = setTimeout(() => {
          console.log('heartbeat timeout')
          this.ws.close(4001)
        }, HEARTBEAT_TIMEOUT)
      }
    }, HEARTBEAT_INTERVAL)
  }

  // TODO use emitter instead callback
  async connect (host, { onMessage, onClose }) {
    let closeCalled = false
    let fulfilled = false

    const handleClose = code => {
      if (onClose && !closeCalled) {
        closeCalled = true // call it only once. error event can be emited after close
        onClose(code)
      }
    }

    return new Promise((resolve, reject) => {
      console.log('%c client %c trying to connect to ' + host, CONSOLE_CLIENT_COLOR, '')
      // use websocket from ws library instead browser implementation
      // ws provides
      // - callback for data written out
      // - ping event
      this.ws = new WebSocket(host)
      this.ws.addEventListener('open', () => {
        console.log('%c client %c connected to ' + host, CONSOLE_CLIENT_COLOR, '')
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
      })

      this.ws.addEventListener('error', e => {
        console.log(`%c client %c websocket error ${e.message}`, CONSOLE_CLIENT_COLOR, '')
        this.ws = null
        if (!fulfilled) {
          reject(e)
        }
        handleClose(null)
      })

      this.ws.addEventListener('message', ev => {
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
            if (!fulfilled) {
              fulfilled = true
              reject(msg)
            }
            this.emit('error', msg.payload)
            return
          }
          if (msg.type === 'WELCOME') {
            console.log('%c client %c session id assigned ' + msg.payload.sessionId, CONSOLE_CLIENT_COLOR, '')
            fulfilled = true
            resolve()
          }
          this.heartbeat()
          onMessage(msg)
          this.emit('message', msg)
        }
        if (this.debugDelay) {
          setTimeout(() => {
            handle()
          }, randomInt(...this.debugDelay))
        } else {
          handle()
        }
      })

      this.ws.addEventListener('close', ev => {
        clearTimeout(this.pingTimeout)
        clearTimeout(this.pongTimeout)
        console.log(`%c client %c websocket closed  code: ${ev.code} reason: ${ev.reason}`, CONSOLE_CLIENT_COLOR, '')
        this.ws = null
        this.emit('close', ev)
        if (!fulfilled) {
          reject(ev)
        }
        handleClose(ev.code)
      })
    })
  }

  disconnect () {
    if (this.ws) {
      this.ws.close()
      this.ws = null
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
