import fs from 'fs'

import { loadSettings, isSaveInProgress, SETTINGS_FILE } from './settings'

export default function (win) {
  try {
    fs.watch(SETTINGS_FILE, eventType => {
      if (eventType === 'change' && !isSaveInProgress()) {
        loadSettings().then(settings => {
          win.webContents.send('settings.changed', { settings, file: SETTINGS_FILE })
        })
      }
    })
    console.log(`Watching ${SETTINGS_FILE}`)
  } catch (e) {
    console.error(e)
  }
}
