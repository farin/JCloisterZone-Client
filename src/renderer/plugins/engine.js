import path from 'path'
import crypto from 'crypto'
import { spawn } from 'child_process'
import debounce from 'lodash/debounce'
import Vue from 'vue'

import { remote } from 'electron'

class BaseEngine {
  async enableBulkMode () {
    this.bulkMode = true
    await this._write('%bulk on')
  }

  async disableBulkMode () {
    this.bulkMode = false
    return new Promise((resolve, reject) => {
      this.onMessage = { resolve, reject }
      this._write('%bulk off')
    })
  }

  writeMessage (message) {
    if (this.loggingEnabled) {
      console.groupCollapsed(message.type)
      console.log(message.payload)
      console.groupEnd()
    }

    if (this.bulkMode) {
      return this._write(JSON.stringify(message)).then(() => null)
    }
    return new Promise((resolve, reject) => {
      if (this.onMessage) {
        console.error('unresolved onMessage')
      }
      this.onMessage = { resolve, reject }
      this._write(JSON.stringify(message))
    })
  }
}

class Engine extends BaseEngine {
  constructor (engineProcess, loggingEnabled) {
    super()
    this.engineProcess = engineProcess
    this.loggingEnabled = loggingEnabled
    this.onMessage = null
    this.bulkMode = false

    let stdoutData = []
    let stderrData = []

    const emitError = debounce(() => {
      if (stderrData.length) {
        const data = stderrData.join('\n')
        this.errHandler && this.errHandler(data)
        stderrData = []
      }
    }, 100)

    console.log(`Engine started ${engineProcess.pid}`)

    this.engineProcess.stderr.on('data', data => {
      data = data.toString().trim() // convert buffer to string
      console.error(data)
      if (!data.startsWith('#')) {
        stderrData.push(data)
        emitError()
      }
    })

    this.engineProcess.stdout.on('data', data => {
      data = data.toString()
      if (!data) {
        return
      }

      if (!data.endsWith('\n')) {
        stdoutData.push(data)
        return
      } else if (stdoutData.length) {
        stdoutData.push(data)
        data = stdoutData.join('')
        stdoutData = []
      }

      try {
        const response = JSON.parse(data)
        const hash = crypto.createHash('sha1').update(data).digest('hex')
        if (loggingEnabled) {
          console.debug(response)
        }
        if (this.onMessage) {
          const { resolve } = this.onMessage
          this.onMessage = null
          resolve({ response, hash })
        }
      } catch (e) {
        console.error('Received invalid json: ' + data)
        console.error(e)
        if (this.onMessage) {
          const { reject } = this.onMessage
          this.onMessage = null
          reject(e)
        }
      }
    })
  }

  on (type, cb) {
    if (type === 'exit') {
      this.engineProcess.on('exit', cb)
    } else if (type === 'error') {
      this.errHandler = cb
    }
  }

  _write (cmd) {
    return new Promise(resolve => {
      this.engineProcess.stdin.write(cmd + '\n', 'utf-8', resolve)
    })
  }

  kill () {
    console.log('Sending TERM to game engine.')
    this.engineProcess.kill()
  }
}

class SocketEngine extends BaseEngine {
  constructor (socket, loggingEnabled) {
    super()
    this.socket = socket
    this.loggingEnabled = loggingEnabled
    this.onMessage = null
    this.bulkMode = false

    let stdoutData = []

    console.log('SocketEngine connected')

    this.socket.on('error', data => {
      this.errHandler && this.errHandler(data)
    })

    this.socket.on('data', data => {
      data = data.toString()
      if (!data) {
        return
      }

      if (!data.endsWith('\n')) {
        stdoutData.push(data)
        return
      } else if (stdoutData.length) {
        stdoutData.push(data)
        data = stdoutData.join('')
        stdoutData = []
      }

      try {
        const response = JSON.parse(data)
        const hash = crypto.createHash('sha1').update(data).digest('hex')
        if (loggingEnabled) {
          console.debug(response)
        }
        if (this.onMessage) {
          const { resolve } = this.onMessage
          this.onMessage = null
          resolve({ response, hash })
        }
      } catch (e) {
        console.error('Received invalid json: ' + data)
        console.error(e)
        if (this.onMessage) {
          const { reject } = this.onMessage
          this.onMessage = null
          reject(e)
        }
      }
    })
  }

  on (type, cb) {
    if (type === 'exit') {
      this.socket.on('close', cb)
    } else if (type === 'error') {
      this.errHandler = cb
    }
  }

  _write (cmd) {
    return new Promise(resolve => {
      this.socket.write(cmd + '\n', 'utf-8', resolve)
    })
  }

  kill () {
    console.log('Closing socket')
    this.socket.destroy()
  }
}

export default ({ app }, inject) => {
  let spawnedEngine = null

  Vue.prototype.$engine = {
    getJavaExecutable () {
      const { settings } = app.store.state
      return settings.javaPath || 'java'
    },

    getJavaArgs () {
      const { settings } = app.store.state
      if (settings.enginePath) {
        return ['-jar', settings.enginePath]
      }
      // Run against local engine
      if (process.env.NODE_ENV === 'development') {
        return ['-jar', 'Engine.jar']
      }
      const basePath = path.dirname(remote.app.getAppPath())
      return ['-jar', path.join(basePath, 'Engine.jar')]
    },

    isRemote () {
      const { settings } = app.store.state
      const m = /^([.\w]+):(\d+)$/.exec(settings.enginePath)
      if (m) {
        return { port: parseInt(m[2]), host: m[1] }
      }
      return null
    },

    spawn ({ loggingEnabled }) {
      const remote = this.isRemote()
      if (remote) {
        const s = require('net').Socket()
        s.connect(remote.port, remote.host)
        spawnedEngine = new SocketEngine(s, loggingEnabled)
        return spawnedEngine
      } else {
        spawnedEngine = new Engine(spawn(this.getJavaExecutable(), this.getJavaArgs()), loggingEnabled)
        spawnedEngine.engineProcess.on('exit', () => {
          spawnedEngine = null
        })
      }
    },

    kill () {
      if (spawnedEngine) {
        spawnedEngine.kill()
        spawnedEngine = null
      }
    },

    get () {
      return spawnedEngine
    }
  }
}
