import { Menu, ipcMain } from 'electron'
import { getSettings } from '../settings'

let _win
let menu
const enabledState = {}

async function createMenu (win, messages) {
  const $t = key => messages[key.replace('menu.', '')]
  const settings = await getSettings()

  const isMac = process.platform === 'darwin'
  const sessionSubmenu = [
    { id: 'playonline-connect', label: $t('menu.playonline-connect') || 'Play Online', accelerator: 'CommandOrControl+P', click () { win.webContents.send('menu.playonline-connect') } },
    { id: 'playonline-disconnect', label: $t('menu.playonline-disconnect') || 'Disconnect', click () { win.webContents.send('menu.playonline-disconnect') } },
    { type: 'separator' },
    { id: 'new-game', label: $t('menu.new-game') || 'New Game', accelerator: 'CommandOrControl+N', click () { win.webContents.send('menu.new-game') } },
    { id: 'join-game', label: $t('menu.join-game') || 'Join Game', accelerator: 'CommandOrControl+J', click () { win.webContents.send('menu.join-game') } },
    { type: 'separator' },
    { id: 'leave-game', label: $t('menu.leave-game') || 'Leave Game', click () { win.webContents.send('menu.leave-game') } },
    { type: 'separator' },
    { id: 'save-game', label: $t('menu.save-game') || 'Save Game', accelerator: 'CommandOrControl+S', click () { win.webContents.send('menu.save-game') } },
    { id: 'load-game', label: $t('menu.load-game') || 'Load Game / Setup', accelerator: 'CommandOrControl+L', click () { win.webContents.send('menu.load-game') } },
    { type: 'separator' },
    { id: 'settings', label: $t('menu.settings') || 'Settings', accelerator: 'CommandOrControl+,', click () { win.webContents.send('menu.show-settings') } },
    { type: 'separator' },
    { role: isMac ? 'close' : 'quit' }
  ]

  const template = [
    {
      label: $t('menu.session') || 'Session',
      submenu: sessionSubmenu
    },
    {
      label: $t('menu.game') || 'Game',
      submenu: [
        { id: 'undo', label: $t('menu.undo') || 'Undo', accelerator: 'CommandOrControl+Z', click () { win.webContents.send('menu.undo') } },
        { type: 'separator' },
        { id: 'zoom-in', label: $t('menu.zoom-in') || 'Zoom In', accelerator: 'numadd', registerAccelerator: false, click () { win.webContents.send('menu.zoom-in') } },
        { id: 'zoom-out', label: $t('menu.zoom-out') || 'Zoom Out', accelerator: 'numsub', registerAccelerator: false, click () { win.webContents.send('menu.zoom-out') } },
        { type: 'separator' },
        { id: 'game-tiles', label: $t('menu.tiles') || 'Tiles', accelerator: 't', click () { win.webContents.send('menu.game-tiles') } },
        { id: 'toggle-history', label: $t('menu.toggle-history') || 'Toggle History', accelerator: 'h', click () { win.webContents.send('menu.game-history') } },
        { type: 'separator' },
        { id: 'game-setup', label: $t('menu.show-game-setup') || 'Show game setup', click () { win.webContents.send('menu.game-setup') } }
      ]
    }, {
      label: $t('menu.help') || 'Help',
      submenu: [
        { label: ($t('menu.rules') || 'Rules') + ' (WikiCarpedia)', click () { win.webContents.send('menu.rules') } },
        { type: 'separator' },
        { label: $t('menu.about') || 'About', click () { win.webContents.send('menu.about') } }
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
    Object.assign(enabledState, update)
  })

  ipcMain.handle('translate-menu', (ev, messages) => {
    if (_win) {
      createMenu(_win, messages)
      Object.entries(enabledState).forEach(([id, enabled]) => {
        const item = menu.getMenuItemById(id)
        if (item) {
          item.enabled = enabled
        }
      })
    }
  })

  return {
    winCreated (win) {
      _win = win
      createMenu(win, {})
    },
    winClosed (win) {
      _win = null
    }
  }
}
