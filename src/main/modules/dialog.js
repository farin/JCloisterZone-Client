import { dialog, ipcMain } from 'electron'

export default function (win) {
  ipcMain.handle('dialog.showOpenDialog', async (ev, opts) => {
    return await dialog.showOpenDialog(opts)
  })

  ipcMain.handle('dialog.showSaveDialog', async (ev, opts) => {
    return await dialog.showSaveDialog(opts)
  })

  ipcMain.handle('dialog.showErrorBox', async (ev, msg) => {
    dialog.showErrorBox(msg)
  })
}
