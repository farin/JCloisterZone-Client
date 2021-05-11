/* globals INCLUDE_RESOURCES_PATH */
import path from 'path'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import electronLogger from 'electron-log'

import settings from './settings'
import menu from './modules/menu'
import theme from './modules/theme'
import dialog from './modules/dialog'
import updater from './modules/updater'
import winevents from './modules/winevents'
import settingsWatch from './modules/settingsWatch'

autoUpdater.logger = electronLogger
autoUpdater.logger.transports.file.level = 'info'

const modules = []

function createWindow () {
  const win = new BrowserWindow({
    height: 600,
    width: 1000,
    icon: path.join(__dirname, '..', 'resources', 'icon.ico'),
    webPreferences: {
      zoomFactor: 1,
      webSecurity: false,
      nodeIntegration: true, // allow loading modules via the require () function
      contextIsolation: false,
      additionalArguments: [
        '--user-data=' + app.getPath('userData'),
        '--app-path' + app.getAppPath(),
        '--app-version=' + app.getVersion()
      ],
      devTools: !process.env.SPECTRON // disable on e2e test environment
    }
  })

  win.loadURL(process.env.NODE_ENV === 'development' ? process.env.DEV_SERVER_URL : 'app://./index.html')
  win.once('ready-to-show', () => {
    win.maximize()
    win.show()
  })

  modules.forEach(m => m.winCreated(win))
  win.on('close', ev => {
    modules.forEach(m => m.winClosed(win))
  })

  return win
}

app.whenReady().then(() => {
  // protocol.registerFileProtocol('file', (request, callback) => {
  //   const pathname = request.url.replace('file:///', '')
  //   callback(pathname)
  // })

  settings().then(settings => {
    modules.push(settingsWatch(settings))
    modules.push(theme(settings))
    modules.push(menu(settings))
    modules.push(dialog(settings))
    modules.push(winevents(settings))

    if (process.env.NODE_ENV === 'production') {
      modules.push(updater(settings))
    }

    createWindow()
  })
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') app.quit()

  // fpr now quit it alsi on Mac
  app.quit()
})
