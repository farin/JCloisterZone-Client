import { time } from 'console'
import fs from 'fs'

import { loadSettings, isSaveInProgress, SETTINGS_FILE } from '../settings'

let timeout = null
let watcher = null

export default function () {
  return {
    winCreated (win) {
      timeout = setTimeout(() => {
        try {
          watcher = fs.watch(SETTINGS_FILE, eventType => {
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
      }, 500)
    },

    winClosed () {
      clearTimeout(timeout)

      if (watcher) {
        watcher.close()
        watcher = null
      }
    }
  }
}
