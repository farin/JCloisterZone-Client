
import debounce from 'lodash/debounce'

export default class Engine {
  constructor (engineProcess) {
    this.engineProcess = engineProcess
    this.pid = engineProcess.pid

    let stdoutData = []
    let stderrData = []

    const emitError = debounce(() => {
      if (stderrData.length) {
        const data = stderrData.join('\n')
        this.errHandler && this.errHandler(data)
        stderrData = []
      }
    }, 100)

    console.log(`Engine started ${this.pid}`)

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

  write (cmd) {
    return new Promise(resolve => {
      this.engineProcess.stdin.write(cmd + '\n', 'utf-8', resolve)
    })
  }
}
