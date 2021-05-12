import path from 'path'
import { ipcMain, app } from 'electron'

let win = null

export default function () {
  ipcMain.handle('win.isVisible', () => {
    return win && !win.isMinimized() && !win.isVisible()
  })

  ipcMain.handle('win.setProgressBar', async (ev, args) => {
    if (win) {
      win.setProgressBar(...args)
    }
  })

  ipcMain.handle('win.setIcon', async (ev, icon) => {
    if (win) {
      if (process.env.NODE_ENV === 'development') {
        win.setIcon(path.join('icons', icon))
      } else {
        const basePath = path.dirname(app.getAppPath())
        win.setIcon(path.join(basePath, 'icons', icon))
      }
    }
  })

  return {
    winCreated (_win) {
      win = _win
      win.on('restore', ev => win.webContents.send('win.restore'))
      win.on('show', ev => win.webContents.send('win.show'))
      win.on('focus', ev => win.webContents.send('win.focus'))
      win.on('minimize', ev => win.webContents.send('win.minimize'))
      win.on('hide', ev => win.webContents.send('win.hide'))
      win.on('blur', ev => win.webContents.send('win.blur'))
    },
    winClosed (_win) {
      win = null
    }
  }
}
