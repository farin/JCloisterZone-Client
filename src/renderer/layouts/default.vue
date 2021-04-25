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
import { webFrame, shell, ipcRenderer } from 'electron'
import remote from '@electron/remote'
import { mapState, mapGetters } from 'vuex'

import AboutDialog from '@/components/AboutDialog'
import JoinGameDialog from '@/components/JoinGameDialog'
import SettingsDialog from '@/components/SettingsDialog'
import { getAppVersion } from '@/utils/version'

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

    ipcRenderer.on('menu.playonline-connect', () => {
      this.$store.dispatch('networking/connectPlayOnline')
    })
    ipcRenderer.on('menu.playonline-disconnect', () => {
      this.$store.dispatch('networking/close')
      this.$router.push('/')
    })
    ipcRenderer.on('menu.new-game', () => {
      this.$store.dispatch('gameSetup/newGame')
    })
    ipcRenderer.on('menu.join-game', () => {
      this.showJoinDialog = true
    })
    ipcRenderer.on('menu.leave-game', () => {
      this.leaveGame()
    })
    ipcRenderer.on('menu.save-game', () => {
      this.$store.dispatch('game/save')
    })
    ipcRenderer.on('menu.load-game', () => {
      this.$store.dispatch('game/load')
    })
    ipcRenderer.on('menu.show-settings', () => {
      this.showSettings = true
    })
    ipcRenderer.on('menu.undo', () => {
      this.$store.dispatch('game/undo')
    })
    ipcRenderer.on('menu.zoom-in', () => {
      this.$root.$emit('request-zoom', 1.4)
    })
    ipcRenderer.on('menu.zoom-out', () => {
      this.$root.$emit('request-zoom', -1.4)
    })
    ipcRenderer.on('menu.game-tiles', () => {
      this.$store.commit('showGameTiles', !this.$store.state.showGameTiles)
    })
    ipcRenderer.on('menu.game-history', () => {
      this.$store.commit('toggleGameHistory')
    })
    ipcRenderer.on('menu.game-setup', () => {
      this.$store.commit('showGameSetup', true)
    })
    ipcRenderer.on('menu.rules', () => {
      shell.openExternal('http://wikicarpedia.com/index.php/Main_Page')
    })
    ipcRenderer.on('menu.about', () => {
      this.showAbout = true
    })

    ipcRenderer.on('menu.change-client-id', () => {
      this.changeClientId()
    })
    ipcRenderer.on('menu.dump-server', () => {
      this.dumpServer()
    })
    ipcRenderer.on('menu.reload-artworks', () => {
      this.$theme.loadArtworks()
    })
    ipcRenderer.on('menu.theme-inspector', () => {
      this.$router.push('/theme-inspector')
    })
  },

  async mounted () {
    webFrame.setZoomLevel(0)
    webFrame.setVisualZoomLevelLimits(1, 1)

    const onThemeChange = val => {
      if (val === 'dark') {
        this.$vuetify.theme.dark = true
        ipcRenderer.invoke('theme.change', 'dark')
      } else {
        this.$vuetify.theme.dark = false
        ipcRenderer.invoke('theme.change', 'light')
      }
    }

    await this.$store.dispatch('settings/loaded', await ipcRenderer.invoke('settings.get'))
    onThemeChange(this.$store.state.settings.theme)

    ipcRenderer.on('settings.changed', (ev, value) => {
      this.$store.dispatch('settings/loaded', value)
    })

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

    await this.$store.dispatch('settings/registerChangeCallback', ['theme', onThemeChange])
    await this.$store.dispatch('settings/registerChangeCallback', ['userArtworks', () => { this.$theme.loadPlugins() }])
    await this.$store.dispatch('settings/registerChangeCallback', ['enabledArtworks', () => { this.$theme.loadArtworks() }])
    await this.$store.dispatch('settings/registerChangeCallback', ['dev', () => { this.updateMenu() }])
    await this.$store.dispatch('settings/registerChangeCallback', ['experimental.playOnline', () => { this.updateMenu() }])
  },

  beforeDestroy () {
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
      this.menu.getMenuItemById('game-setup').enabled = gameRunning

      if (this.$store.state.settings.devMode) {
        // devMode can be change in runtime, then menu item may not exist
        const dumpServerItem = this.menu.getMenuItemById('dump-server')
        if (dumpServerItem) {
          dumpServerItem.enabled = this.$server.isRunning()
        }
        const inspectorItem = this.menu.getMenuItemById('theme-inspector')
        if (inspectorItem) {
          inspectorItem.enabled = !gameOpen
        }
      }
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

    onKeyDown (ev) {
      if (ev.key === '+') { // bind both + and numpad +
        this.zoomIn()
        return
      }
      if (ev.key === '-') {
        this.zoomOut()
        return
      }
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
