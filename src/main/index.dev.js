import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import electronDebug from 'electron-debug'
import vueDevtools from 'vue-devtools'
// import { ELECTRON_RELAUNCH_CODE } from '../../.electron-nuxt/config'
import mainWinHandler from './mainWindow'
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

electronDebug({
  showDevTools: false,
  devToolsMode: 'right'
})

// work around https://github.com/MarshallOfSound/electron-devtools-installer/issues/122
// which seems to be a result of https://github.com/electron/electron/issues/19468
if (process.platform === 'win32') {
  const appUserDataPath = app.getPath('userData')
  const devToolsExtensionsPath = path.join(appUserDataPath, 'DevTools Extensions')
  try {
    fs.unlinkSync(devToolsExtensionsPath)
  } catch (_) {
    // don't complain if the file doesn't exist
  }
}

app.whenReady().then(() => {
  vueDevtools.install()
})

mainWinHandler.onCreated(browserWindow => {
  browserWindow.webContents.openDevTools()
})

// Require `main` process to boot app
require('./index')
