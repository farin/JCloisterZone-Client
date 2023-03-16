import { app, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import electronLogger from 'electron-log'
import { compareVersions } from 'compare-versions'

let diffDown = {
  percent: 0,
  bytesPerSecond: 0,
  total: 0,
  transferred: 0
}
let diffDownHelper = {
  startTime: 0,
  lastTime: 0,
  lastSize: 0
}

let win = null
let updateInfo = null

export default function () {
  // https://gist.github.com/the3moon/0e9325228f6334dabac6dadd7a3fc0b9
  electronLogger.hooks.push((msg, transport) => {
    if (transport !== electronLogger.transports.console) {
      return msg
    }

    let match = /Full: ([\d,.]+) ([GMKB]+), To download: ([\d,.]+) ([GMKB]+)/.exec(
      msg.data[0]
    )
    if (match) {
      let multiplier = 1
      if (match[4] === 'KB') multiplier *= 1024
      if (match[4] === 'MB') multiplier *= 1024 * 1024
      if (match[4] === 'GB') multiplier *= 1024 * 1024 * 1024

      diffDown = {
        percent: 0,
        bytesPerSecond: 0,
        total: Number(match[3].split(',').join('')) * multiplier,
        transferred: 0
      }
      diffDownHelper = {
        startTime: Date.now(),
        lastTime: Date.now(),
        lastSize: 0
      }
      return msg
    }

    match = /download range: bytes=(\d+)-(\d+)/.exec(msg.data[0])
    if (match) {
      const currentSize = Number(match[2]) - Number(match[1])
      const currentTime = Date.now()
      const deltaTime = currentTime - diffDownHelper.startTime

      diffDown.transferred += diffDownHelper.lastSize
      diffDown.bytesPerSecond = Math.floor(
        (diffDown.transferred * 1000) / deltaTime
      )
      diffDown.percent = (diffDown.transferred * 100) / diffDown.total

      diffDownHelper.lastSize = currentSize
      diffDownHelper.lastTime = currentTime
      win.webContents.send('update-progress', diffDown)
      return msg
    }
    return msg
  })

  ipcMain.on('do-update', async () => {
    await autoUpdater.downloadUpdate()
    if (win) {
      win.webContents.send('update-progress', { percent: 100 })
    }
    autoUpdater.quitAndInstall()
  })

  // const log = require(''electron-log')
  // log.transports.file.level = 'debug'
  // autoUpdater.logger = log
  autoUpdater.autoDownload = false
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'farin',
    repo: 'JCloisterZone-Client'
  })
  autoUpdater.checkForUpdates().then(result => {
    // console.log(result)
    if (compareVersions(result.updateInfo.version, app.getVersion()) === 1) {
      updateInfo = result.updateInfo
      if (win) {
        win.webContents.send('app-update', updateInfo)
      }
    }
  }).catch(err => {
    console.error(err)
  })

  return {
    winCreated (_win) {
      win = _win
      if (updateInfo) {
        win.webContents.send('app-update', updateInfo)
      }
    },
    winClosed (_win) { win = null }
  }
}
