import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import electronDebug from 'electron-debug'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
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
  installExtension(VUEJS_DEVTOOLS)
    .then(name => console.log(`Added Extension:  ${name}`))
    .catch(err => console.log('An error occurred: ', err))
})

// Require `main` process to boot app
require('./index')
