import { nativeTheme, ipcMain } from 'electron'

export default function (win) {
  ipcMain.handle('theme.change', async (ev, theme) => {
    nativeTheme.themeSource = theme
  })
}
