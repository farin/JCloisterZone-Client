import { Menu } from 'electron'

let menu

function createMenu (win, settings) {
  settings = settings || {}

  const isMac = process.platform === 'darwin'
  const sessionSubmenu = [
    { id: 'playonline-connect', label: 'Play Online', accelerator: 'CommandOrControl+P', click () { win.webContents.send('menu.playonline-connect') } },
    { id: 'playonline-disconnect', label: 'Disconnect', click () { win.webContents.send('menu.playonline-dicconnect') } },
    { type: 'separator' },
    { id: 'new-game', label: 'New Game', accelerator: 'CommandOrControl+N', click () { win.webContents.send('menu.new-game') } },
    { id: 'join-game', label: 'Join Game', accelerator: 'CommandOrControl+J', click () { win.webContents.send('menu.join-game') } },
    { type: 'separator' },
    { id: 'leave-game', label: 'Leave Game', click () { win.webContents.send('menu.leave-game') } },
    { type: 'separator' },
    { id: 'save-game', label: 'Save Game', accelerator: 'CommandOrControl+S', click () { win.webContents.send('menu.save-game') } },
    { id: 'load-game', label: 'Load Game', accelerator: 'CommandOrControl+L', click () { win.webContents.send('menu.load-game') } },
    { type: 'separator' },
    { id: 'settigns', label: 'Settings', accelerator: 'CommandOrControl+,', click () { win.webContents.send('menu.show-settings') } },
    { type: 'separator' },
    isMac ? { role: 'close' } : { role: 'quit' }
  ]

  if (!settings['experimental.playOnline']) {
    sessionSubmenu.splice(0, 3)
  }

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
    template.push({
      label: 'Dev',
      submenu: [
        { role: 'toggleDevTools', label: 'Toggle DevTools' },
        { label: 'Change clientId', click () { win.webContents.send('menu.change-client-id') } },
        { id: 'dump-server', label: 'Dump hosted game server state', click () { win.webContents.send('menu.dump-server') } },
        { label: 'Reload artwokrs', click () { win.webContents.send('menu.reload-artworks') } },
        { id: 'theme-inspector', label: 'Theme inspector', click () { win.webContents.send('menu.theme-inspector') } }
      ]
    })
  }

  menu = Menu.buildFromTemplate(template)
  // this.updateMenu()
  Menu.setApplicationMenu(menu)
}

export default function (win, settings) {
  createMenu(win, settings)
}
