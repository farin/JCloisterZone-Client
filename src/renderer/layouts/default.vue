<template>
  <v-app>
    <nuxt />
    <v-dialog
      v-model="showAbout"
      max-width="600"
    >
      <AboutDialog
        @close="showAbout = false"
      />
    </v-dialog>
    <v-dialog
      v-model="showJoinDialog"
      max-width="600"
    >
      <!-- use if to always create fresh dialog instance -->
      <JoinGameDialog
        v-if="showJoinDialog"
        @close="showJoinDialog = false"
      />
    </v-dialog>
    <v-dialog
      v-model="showSettings"
      content-class="settings-dialog"
      max-width="800"
    >
      <SettingsDialog
        ref="settings"
        @close="showSettings = false"
      />
    </v-dialog>
  </v-app>
</template>

<script>
import os from 'os'
import fs from 'fs'
import { extname } from 'path'
import { webFrame, remote, shell, ipcRenderer } from 'electron'
import { mapState, mapGetters } from 'vuex'

import AboutDialog from '@/components/AboutDialog'
import JoinGameDialog from '@/components/JoinGameDialog'
import SettingsDialog from '@/components/SettingsDialog'
import { getAppVersion } from '@/utils/version'

const { Menu } = remote

export default {
  components: {
    AboutDialog,
    JoinGameDialog,
    SettingsDialog
  },

  data () {
    return {
      showAbout: false
    }
  },

  computed: {
    ...mapState({
      java: state => state.java,
      onlineConnected: state => state.networking.connectionType === 'online'
    }),

    ...mapGetters({
      undoAllowed: 'game/isUndoAllowed'
    }),

    showJoinDialog: {
      get () {
        return this.$store.state.showJoinDialog
      },

      set (value) {
        this.$store.commit('showJoinDialog', value)
      }
    },

    showSettings: {
      get () {
        return this.$store.state.showSettings
      },

      set (value) {
        this.$store.commit('showSettings', value)
      }
    }
  },

  watch: {
    $route (to) {
      this.updateMenu()
    },

    undoAllowed () {
      this.updateMenu()
    },

    onlineConnected () {
      this.updateMenu()
    },

    showSettings (val) {
      if (val) {
        this.$refs.settings?.clean()
      }
    }
  },

  created () {
    ipcRenderer.on('app-update', (event, updateInfo) => {
      this.$store.commit('updateInfo', updateInfo)
    })
    ipcRenderer.on('update-progress', (event, progress) => {
      this.$store.commit('updateProgress', progress.percent)
    })
  },

  async mounted () {
    webFrame.setZoomLevel(0)
    webFrame.setVisualZoomLevelLimits(1, 1)

    const onThemeChange = val => {
      if (val === 'dark') {
        this.$vuetify.theme.dark = true
        remote.nativeTheme.themeSource = 'dark'
      } else {
        this.$vuetify.theme.dark = false
        remote.nativeTheme.themeSource = 'light'
      }
    }

    await this.$store.dispatch('settings/load')
    onThemeChange(this.$store.state.settings.theme)

    const isMac = process.platform === 'darwin'
    const sessionSubmenu = [
      { id: 'playonline-connect', label: 'Play Online', accelerator: 'CommandOrControl+P', click: this.playOnline },
      { id: 'playonline-disconnect', label: 'Disconnect', click: this.disconnect },
      { type: 'separator' },
      { id: 'new-game', label: 'New Game', accelerator: 'CommandOrControl+N', click: this.newGame },
      { id: 'join-game', label: 'Join Game', accelerator: 'CommandOrControl+J', click: this.joinGame },
      { type: 'separator' },
      { id: 'leave-game', label: 'Leave Game', click: this.leaveGame },
      { type: 'separator' },
      { id: 'save-game', label: 'Save Game', accelerator: 'CommandOrControl+S', click: this.saveGame },
      { id: 'load-game', label: 'Load Game', accelerator: 'CommandOrControl+L', click: this.loadGame },
      { type: 'separator' },
      { id: 'settigns', label: 'Settings', accelerator: 'CommandOrControl+,', click: () => { this.showSettings = true } },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]

    if (!this.$store.state.settings['experimental.playOnline']) {
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
          { id: 'undo', label: 'Undo', accelerator: 'CommandOrControl+Z', click: this.undo },
          { type: 'separator' },
          { id: 'zoom-in', label: 'Zoom In', accelerator: 'numadd', click: this.zoomIn },
          { id: 'zoom-out', label: 'Zoom Out', accelerator: 'numsub', click: this.zoomOut },
          { type: 'separator' },
          { id: 'game-tiles', label: 'Tiles', accelerator: 't', click: this.toggleRemainingTiles },
          { id: 'toggle-history', label: 'Toggle History', accelerator: 'h', click: this.toggleGameHistory },
          { type: 'separator' },
          { id: 'game-setup', label: 'Show game setup', click: this.showGameSetup }
        ]
      }, {
        label: 'Help',
        submenu: [
          { label: 'Rules (WikiCarpedia)', click: this.showRules },
          { type: 'separator' },
          { label: 'About', click: () => { this.showAbout = true } }
        ]
      }
    ]
    if (this.$store.state.settings.devMode) {
      template.push({
        label: 'Dev',
        submenu: [
          { role: 'toggleDevTools', label: 'Toggle DevTools' },
          { label: 'Change clientId', click: this.changeClientId },
          { id: 'dump-server', label: 'Dump hosted game server state', click: this.dumpServer },
          { label: 'Reload artwokrs', click: () => { this.$theme.loadArtworks() } }
        ]
      })
    }

    this.menu = Menu.buildFromTemplate(template)
    this.updateMenu()
    Menu.setApplicationMenu(this.menu)

    try {
      await this.$store.dispatch('checkJavaVersion')
      if (this.java?.ok) {
        this.$store.dispatch('checkEngineVersion')
      }
    } catch {
      // do nothing, state flags asre set
    }
    this.$store.dispatch('loadPlugins')

    window.addEventListener('keydown', this.onKeyDown)

    this.$store.dispatch('settings/watchSettingsFile')
    // todo watch also artworks folder

    await this.$store.dispatch('settings/registerChangeCallback', ['theme', onThemeChange])
    await this.$store.dispatch('settings/registerChangeCallback', ['userArtworks', () => { this.$theme.loadPlugins() }])
    await this.$store.dispatch('settings/registerChangeCallback', ['enabledArtworks', () => { this.$theme.loadArtworks() }])
    await this.$store.dispatch('settings/registerChangeCallback', ['dev', () => { this.updateMenu() }])
    await this.$store.dispatch('settings/registerChangeCallback', ['experimental.playOnline', () => { this.updateMenu() }])
  },

  beforeDestroy () {
    this.$store.dispatch('settings/unwatchSettingsFile')
    window.removeEventListener('keydown', this.onKeyDown)
  },

  methods: {
    updateMenu () {
      if (!this.menu) {
        return
      }
      const routeName = this.$route.name
      const gameOpen = routeName === 'game-setup' || routeName === 'open-game' || routeName === 'game'
      const gameRunning = routeName === 'game'
      const playOnlineConnect = this.menu.getMenuItemById('playonline-connect')
      const playOnlineDisConnect = this.menu.getMenuItemById('playonline-disconnect')
      playOnlineConnect && (playOnlineConnect.enabled = !this.onlineConnected && !gameOpen)
      playOnlineDisConnect && (playOnlineDisConnect.enabled = this.onlineConnected)
      this.menu.getMenuItemById('new-game').enabled = !this.onlineConnected && !gameOpen
      this.menu.getMenuItemById('join-game').enabled = !this.onlineConnected && !gameOpen
      this.menu.getMenuItemById('leave-game').enabled = gameOpen
      this.menu.getMenuItemById('save-game').enabled = gameRunning
      this.menu.getMenuItemById('load-game').enabled = !gameOpen
      this.menu.getMenuItemById('undo').enabled = gameRunning && this.undoAllowed
      this.menu.getMenuItemById('zoom-in').enabled = gameRunning
      this.menu.getMenuItemById('zoom-out').enabled = gameRunning
      this.menu.getMenuItemById('toggle-history').enabled = gameRunning
      this.menu.getMenuItemById('game-tiles').enabled = gameRunning

      if (this.$store.state.settings.devMode) {
        // devMode can be change in runtime, then menu item may not exist
        const item = this.menu.getMenuItemById('dump-server')
        if (item) {
          item.enabled = this.$server.isRunning()
        }
      }
    },

    playOnline () {
      this.$store.dispatch('networking/connectPlayOnline')
    },

    disconnect () {
      this.$store.dispatch('networking/close')
      this.$router.push('/')
    },

    newGame () {
      this.$store.dispatch('gameSetup/newGame')
    },

    joinGame () {
      this.showJoinDialog = true
    },

    leaveGame () {
      if (this.onlineConnected) {
        const { $connection } = this
        const gameId = this.$store.state.game.id
        if (gameId) {
          $connection.send({ type: 'LEAVE_GAME', payload: { gameId } })
        }
        this.$router.push('/online')
      } else {
        this.$store.dispatch('game/close')
        this.$router.push('/')
      }
    },

    async saveGame () {
      await this.$store.dispatch('game/save')
    },

    async loadGame () {
      await this.$store.dispatch('game/load')
    },

    undo () {
      this.$store.dispatch('game/undo')
    },

    zoomIn () {
      this.$root.$emit('request-zoom', 1.4)
    },

    zoomOut () {
      this.$root.$emit('request-zoom', -1.4)
    },

    toggleRemainingTiles () {
      this.$store.commit('showGameTiles', !this.$store.state.showGameTiles)
    },

    toggleGameHistory () {
      this.$store.commit('toggleGameHistory')
    },

    showGameSetup () {
      this.$store.commit('showGameSetup', true)
    },

    showRules () {
      shell.openExternal('http://wikicarpedia.com/index.php/Main_Page')
    },

    onKeyDown (ev) {
      if (ev.key === 'Escape' && this.showAbout) {
        this.showAbout = false
        ev.preventDefault()
        ev.stopPropagation()
      }
    },

    changeClientId () {
      const [base, suffix = '0'] = this.$store.state.settings.clientId.split('--', 2)
      const newId = `${base}--${~~suffix + 1}`
      this.$store.commit('settings/clientId', newId)
      console.log(`Client id changed to ${newId}`)
    },

    async dumpServer () {
      const data = {
        appVersion: getAppVersion(),
        engineVersion: this.$store.state.engine?.version,
        date: (new Date()).toISOString(),
        os: `${os.platform()} ${os.release()}`,
        java: this.java ? `${this.java.vendor} ${this.java.version}` : '',
        ...this.$server.getServer().dump()
      }

      const { dialog } = remote
      let { filePath } = await dialog.showSaveDialog({
        title: 'Save Server Dump',
        filters: [{ name: 'JSON files', extensions: ['json'] }],
        properties: ['createDirectory', 'showOverwriteConfirmation']
      })
      if (filePath) {
        if (extname(filePath) === '') {
          filePath += '.json'
        }
        fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
          if (err) {
            console.error(err)
          } else {
            console.log(`Dump save to ${filePath}`)
          }
        })
      }
    }
  }
}
</script>

<style lang="sass">
@import 'typeface-roboto/index.css'
@import '~vuetify/src/styles/styles.sass'

@import '~/assets/styles/player-colors.scss'
@import '~/assets/styles/rotation.sass'

:root
  --aside-width: 290px
  --aside-width-plus-gap: #{290px + $panel-gap}

  @media #{map-get($display-breakpoints, 'lg-and-down')}
    --aside-width: 250px
    --aside-width-plus-gap: #{250px + $panel-gap}

  @media #{map-get($display-breakpoints, 'md-and-down')}
    --aside-width: 210px
    --aside-width-plus-gap: #{210px + $panel-gap}

html
  overflow-y: auto

body
  margin: 0 !important

.view
  width: 100%
  min-height: 100vh

svg, g, use
  &.dragon
    fill: $dragon-color

svg, g, use
  &.fairy
    fill: $fairy-color

svg, g, use
  &.count
    fill: $count-color

svg, g, use
  &.mage
    fill: $mage-color

svg, g, use
  &.witch
    fill: $witch-color

.settings-dialog
  height: 80vh
  display: grid

#theme-resources
  display: none
</style>
