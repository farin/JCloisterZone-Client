import { Menu, ipcMain } from 'electron'
import { getSettings } from '../settings'

let menu

async function createMenu (win) {
  const settings = await getSettings()

  const isMac = process.platform === 'darwin'
  const sessionSubmenu = [
    { id: 'playonline-connect', label: 'Play Online', accelerator: 'CommandOrControl+P', click () { win.webContents.send('menu.playonline-connect') } },
    { id: 'playonline-disconnect', label: 'Disconnect', click () { win.webContents.send('menu.playonline-disconnect') } },
    { type: 'separator' },
    { id: 'new-game', label: 'New Game', accelerator: 'CommandOrControl+N', click () { win.webContents.send('menu.new-game') } },
    { id: 'join-game', label: 'Join Game', accelerator: 'CommandOrControl+J', click () { win.webContents.send('menu.join-game') } },
    { type: 'separator' },
    { id: 'leave-game', label: 'Leave Game', click () { win.webContents.send('menu.leave-game') } },
    { type: 'separator' },
    { id: 'save-game', label: 'Save Game', accelerator: 'CommandOrControl+S', click () { win.webContents.send('menu.save-game') } },
    { id: 'load-game', label: 'Load Game / Setup', accelerator: 'CommandOrControl+L', click () { win.webContents.send('menu.load-game') } },
    { type: 'separator' },
    { id: 'settigns', label: 'Settings', accelerator: 'CommandOrControl+,', click () { win.webContents.send('menu.show-settings') } },
    { type: 'separator' },
    isMac ? { role: 'close' } : { role: 'quit' }
  ]

  const template = [
    {
      label: 'Session',
      submenu: sessionSubmenu
    },
    {
      label: 'Game',
      submenu: [
        { id: 'undo', label: 'Undo', accelerator: 'CommandOrControl+Z', click () { win.webContents.send('menu.undo') } },
        { type: 'separator' },
        { id: 'zoom-in', label: 'Zoom In', accelerator: 'numadd', registerAccelerator: false, click () { win.webContents.send('menu.zoom-in') } },
        { id: 'zoom-out', label: 'Zoom Out', accelerator: 'numsub', registerAccelerator: false, click () { win.webContents.send('menu.zoom-out') } },
        { type: 'separator' },
        { id: 'game-tiles', label: 'Tiles', accelerator: 't', click () { win.webContents.send('menu.game-tiles') } },
        { id: 'game-farm-hints', label: 'Farm Hints', accelerator: 'f', click () { win.webContents.send('menu.game-farm-hints') } },
        { id: 'toggle-history', label: 'Toggle History', accelerator: 'h', click () { win.webContents.send('menu.game-history') } },
        { type: 'separator' },
        { id: 'game-setup', label: 'Show game setup', click () { win.webContents.send('menu.game-setup') } }
      ]
    }, {
      label: 'Help',
      submenu: [
        { label: 'Rules (WikiCarpedia)', click () { win.webContents.send('menu.rules') } },
        { type: 'separator' },
        { label: 'About', click () { win.webContents.send('menu.about') } }
      ]
    }
  ]

  if (settings.devMode) {
    const toggleRemoteEngine = async () => {
      const currValue = (await getSettings()).enginePath
      win.webContents.send('settings.update', { enginePath: currValue === 'localhost:9000' ? null : 'localhost:9000' })
    }

    const toggleLocalPlayOnline = async () => {
      const currValue = (await getSettings()).playOnlineUrl
      win.webContents.send('settings.update', { playOnlineUrl: currValue === 'localhost:8000/ws' ? 'play-online.jcloisterzone.com/ws' : 'localhost:8000/ws' })
    }

    template.push({
      label: 'Dev',
      submenu: [
        { role: 'toggleDevTools', label: 'Toggle DevTools' },
        { type: 'separator' },
        { id: 'remote-engine', label: 'Use Remote Engine', type: 'checkbox', checked: settings.enginePath === 'localhost:9000', click () { toggleRemoteEngine() } },
        { id: 'local-play-online', label: 'Use Local Play Online', type: 'checkbox', checked: settings.playOnlineUrl === 'localhost:8000/ws', click () { toggleLocalPlayOnline() } },
        { id: 'dump-server', label: 'Dump Hosted Game Server State', click () { win.webContents.send('menu.dump-server') } },
        { id: 'test-runner', label: 'Test Runner', click () { win.webContents.send('menu.test-runner') } },
        { type: 'separator' },
        { label: 'Reload Add-ons', click () { win.webContents.send('menu.reload-addons') } },
        { id: 'theme-inspector', label: 'Theme inspector', click () { win.webContents.send('menu.theme-inspector') } }
      ]
    })
  }

  menu = Menu.buildFromTemplate(template)
  // this.updateMenu()
  Menu.setApplicationMenu(menu)
}

export default function () {
  ipcMain.handle('update-menu', (ev, update) => {
    Object.entries(update).forEach(([id, enabled]) => {
      const item = menu.getMenuItemById(id)
      if (item) {
        item.enabled = enabled
      }
    })
  })

  return {
    winCreated (win) {
      createMenu(win)
    },
    winClosed (win) {}
  }
}
