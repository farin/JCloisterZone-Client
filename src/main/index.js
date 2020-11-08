/* globals INCLUDE_RESOURCES_PATH */
import { app, protocol, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import compareVersions from 'compare-versions'
import winHandler from './mainWindow'

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

ipcMain.on('do-update', async () => {
  await autoUpdater.downloadUpdate()
  autoUpdater.quitAndInstall()
})

if (process.env.NODE_ENV === 'production') {
  winHandler.onCreated(win => {
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
