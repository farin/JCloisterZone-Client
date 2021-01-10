/* globals INCLUDE_RESOURCES_PATH */
import { app, protocol, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import electronLogger from 'electron-log'
import compareVersions from 'compare-versions'
import winHandler from './mainWindow'

autoUpdater.logger = electronLogger
autoUpdater.logger.transports.file.level = 'info'
/**
 * Set `__resources` path to resources files in renderer process
 */
global.__resources = undefined // eslint-disable-line no-underscore-dangle
// noinspection BadExpressionStatementJS
INCLUDE_RESOURCES_PATH // eslint-disable-line no-unused-expressions
if (__resources === undefined) console.error('[Main-process]: Resources path is undefined')

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') app.quit()

  // fpr now quit it alsi on Mac
  app.quit()
})

// https://github.com/electron/electron/issues/23757
// fixes file protocol electron 9+
app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = request.url.replace('file:///', '')
    callback(pathname)
  })
})

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

if (process.env.NODE_ENV === 'production') {
  winHandler.onCreated(win => {
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
      win.webContents.send('update-progress', { percent: 100 })
      autoUpdater.quitAndInstall()
    })

    win.webContents.on('did-finish-load', () => {
      app.whenReady().then(() => {
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
            win.webContents.send('app-update', result.updateInfo)
          }
        }).catch(err => {
          console.error(err)
        })
      })
    })
  })
}
