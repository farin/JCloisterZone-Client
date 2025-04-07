import fs from 'fs'
import path from 'path'
import { app, ipcMain } from 'electron'

export const SETTINGS_FILE = process.env.JCZ_CONFIG || path.join(app.getPath('userData'), 'jcz-config.json')

let settings = null
let saving = false

export function isSaveInProgress () {
  return saving
}

export async function getSettings () {
  return settings || {}
}

export async function loadSettings () {
  try {
    await fs.promises.access(SETTINGS_FILE, fs.constants.R_OK)
    settings = JSON.parse(await fs.promises.readFile(SETTINGS_FILE))
    return settings
  } catch {
    return null
  }
}

export default async function () {
  ipcMain.handle('settings.get', () => {
    return { settings, file: SETTINGS_FILE, systemLocale: app.getSystemLocale() || 'en-US' }
  })

  ipcMain.handle('settings.save', async (ev, data) => {
    saving = true
    await fs.promises.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2))
    settings = data
    saving = false
  })

  console.log(`Loading settings from ${SETTINGS_FILE}`)
  return await loadSettings()
}
