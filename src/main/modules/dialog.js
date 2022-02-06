import { dialog, ipcMain } from 'electron'

export default function () {
  ipcMain.handle('dialog.showOpenDialog', async (ev, opts) => {
    return await dialog.showOpenDialog(opts)
  })

  ipcMain.handle('dialog.showSaveDialog', async (ev, opts) => {
    return await dialog.showSaveDialog(opts)
  })

  // ipcMain.handle('dialog.showErrorBox', async (ev, { title, content }) => {
  //   dialog.showErrorBox(title, content)
  // })

  return {
    winCreated (win) {},
    winClosed (win) {}
  }
}
