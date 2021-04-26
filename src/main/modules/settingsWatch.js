import fs from 'fs'

import { loadSettings, isSaveInProgress, SETTINGS_FILE } from '../settings'

let win = null

export default function () {
  try {
    fs.watch(SETTINGS_FILE, eventType => {
      if (eventType === 'change' && !isSaveInProgress()) {
        loadSettings().then(settings => {
          if (win) {
            win.webContents.send('settings.changed', { settings, file: SETTINGS_FILE })
          }
        })
      }
    })
    console.log(`Watching ${SETTINGS_FILE}`)
  } catch (e) {
    console.error(e)
  }

  return {
    winCreated (_win) { win = _win },
    winClosed (_win) { win = null }
  }
}
