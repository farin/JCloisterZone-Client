
import debounce from 'lodash/debounce'

export default class Engine {
  constructor (engineProcess, loggingEnabled) {
    this.engineProcess = engineProcess
    this.loggingEnabled = loggingEnabled
    this.lastMessage = null

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

      let payload
      try {
        payload = JSON.parse(data)
        if (loggingEnabled) {
          console.debug(payload)
        }
        this.msgHandler && this.msgHandler(payload)
      } catch (e) {
        console.error('Received invalid json: ' + data)
        console.error(e)
      }
    })
  }

  on (type, cb) {
    if (type === 'exit') {
      this.engineProcess.on('exit', cb)
    } else if (type === 'error') {
      this.errHandler = cb
    } else if (type === 'message') {
      this.msgHandler = cb
    }
  }

  _write (cmd) {
    return new Promise(resolve => {
      this.engineProcess.stdin.write(cmd + '\n', 'utf-8', resolve)
    })
  }

  async writeDirective (directive) {
    await this._write(directive)
  }

  async writeMessage (message){
    if (this.loggingEnabled) {
      console.groupCollapsed(message.type)
      console.log(message.payload)
      console.groupEnd()
    }

    this.lastMessage = message
    await this._write(JSON.stringify(message))
  }

  kill () {
    console.log('Sending TERM to game engine.')
    this.engineProcess.kill()
  }
}
