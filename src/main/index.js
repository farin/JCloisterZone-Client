/* globals INCLUDE_RESOURCES_PATH */
import path from 'path'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import electronLogger from 'electron-log'

import settings from './modules/settings'
import menu from './modules/menu'
import theme from './modules/theme'
import updater from './modules/updater'
import settingsWatch from './modules/settingsWatch'

autoUpdater.logger = electronLogger
autoUpdater.logger.transports.file.level = 'info'
/**
 * Set `__resources` path to resources files in renderer process
 */
global.__resources = undefined // eslint-disable-line no-underscore-dangle
// noinspection BadExpressionStatementJS
INCLUDE_RESOURCES_PATH // eslint-disable-line no-unused-expressions
if (__resources === undefined) console.error('[Main-process]: Resources path is undefined')

function createWindow () {
  const win = new BrowserWindow({
    height: 600,
    width: 1000,
    icon: path.join(__dirname, '..', 'resources', 'icon.ico'),
    webPreferences: {
      zoomFactor: 1,
      enableRemoteModule: true,
      webSecurity: false,
      nodeIntegration: true, // allow loading modules via the require () function
      contextIsolation: false,
      additionalArguments: ['--user-data=' + app.getPath('userData')],
      devTools: !process.env.SPECTRON // disable on e2e test environment
    }
  })

  if (process.env.NODE_ENV === 'development') {
    win.loadURL(process.env.DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'))
  }

  win.maximize()
  return win
}

app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = request.url.replace('file:///', '')
    callback(pathname)
  })

  settings().then(settings => {
    const win = createWindow()

    settingsWatch(win)
    theme(win)
    menu(win, settings)

    if (process.env.NODE_ENV === 'production') {
      updater(win)
    } else {
      win.webContents.openDevTools()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') app.quit()

  // fpr now quit it alsi on Mac
  app.quit()
})
