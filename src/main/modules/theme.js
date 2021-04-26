import { nativeTheme, ipcMain } from 'electron'

export default function () {
  ipcMain.handle('theme.change', async (ev, theme) => {
    nativeTheme.themeSource = theme
  })

  return {
    winCreated (win) {},
    winClosed (win) {}
  }
}
