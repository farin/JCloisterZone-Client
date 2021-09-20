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
import { mapState, mapGetters } from 'vuex'

import AboutDialog from '@/components/AboutDialog'
import JoinGameDialog from '@/components/JoinGameDialog'
import SettingsDialog from '@/components/SettingsDialog'
import { getAppVersion } from '@/utils/version'

const ZOOM_SENSITIVITY = 1.4

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

  head () {
    return {
      title: this.onlineConnected ? 'JCloisterZone @ ' + this.playOnlineHostname : 'JCloisterZone'
    }
  },

  computed: {
    ...mapState({
      java: state => state.java,
      onlineConnected: state => state.networking.connectionType === 'online',
      playOnlineHostname: state => state.settings.playOnlineUrl.split('/')[0]
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
      this.$router.push('/game-setup')
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
      this.$root.$emit('request-zoom', ZOOM_SENSITIVITY)
    })
    ipcRenderer.on('menu.zoom-out', () => {
      this.$root.$emit('request-zoom', -ZOOM_SENSITIVITY)
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

    ipcRenderer.on('menu.dump-server', () => {
      this.dumpServer()
    })
    ipcRenderer.on('menu.test-runner', () => {
      this.$router.push('/test-runner')
    })
    ipcRenderer.on('menu.reload-addons', () => {
      this.loadAddons()
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
    this.updateMenu()

    ipcRenderer.on('settings.changed', (ev, value) => {
      this.$store.dispatch('settings/loaded', value)
    })

    ipcRenderer.on('settings.update', (ev, update) => {
      this.$store.dispatch('settings/update', update)
    })

    try {
      await this.$store.dispatch('checkJavaVersion')
      if (this.java?.ok) {
        this.$store.dispatch('checkEngineVersion')
      }
    } catch {
      // do nothing, state flags asre set
    }

    await this.loadAddons()

    window.addEventListener('keydown', this.onKeyDown)

    await this.$store.dispatch('settings/registerChangeCallback', ['theme', onThemeChange])
    await this.$store.dispatch('settings/registerChangeCallback', ['userAddons', () => { this.loadAddons() }])
    await this.$store.dispatch('settings/registerChangeCallback', ['enabledArtworks', (_, source) => {
      if (source === 'load') {
        // load only when triggered by manual user change, otherwise it's cause by addon install/uninstall and reloaed from her
        this.$theme.loadArtworks()
      }
    }])
    await this.$store.dispatch('settings/registerChangeCallback', ['dev', () => { this.updateMenu() }])

    this.$addons.on('change', () => {
      this.loadAddons()
    })
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  methods: {
    async loadAddons () {
      await this.$addons.loadAddons()
      await this.$tiles.loadExpansions()

      // during start up, don't wait for artworks, theme can be loaded in background
      this.$theme.loadArtworks()
    },

    updateMenu () {
      const routeName = this.$route.name
      const gameOpen = routeName === 'game-setup' || routeName === 'open-game' || routeName === 'game'
      const gameRunning = routeName === 'game'

      ipcRenderer.invoke('update-menu', {
        'playonline-connect': !this.onlineConnected && !gameOpen,
        'playonline-disconnect': this.onlineConnected,
        'new-game': !this.onlineConnected && !gameOpen,
        'join-game': !this.onlineConnected && !gameOpen,
        'leave-game': gameOpen,
        'save-game': gameRunning,
        'load-game': !gameOpen,
        'undo': gameRunning && this.undoAllowed,
        'zoom-in': gameRunning,
        'zoom-out': gameRunning,
        'toggle-history': gameRunning,
        'game-tiles': gameRunning,
        'game-setup': gameRunning,
        'dump-server': this.$server.isRunning(),
        'theme-inspector': !gameOpen
      })
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
        this.$root.$emit('request-zoom', ZOOM_SENSITIVITY)
        return
      }
      if (ev.key === '-') {
        this.$root.$emit('request-zoom', -ZOOM_SENSITIVITY)
        return
      }
      if (ev.key === 'Escape') {
        this.$store.commit('board/pointsExpression', null)
        if (this.showAbout) {
          this.showAbout = false
          ev.preventDefault()
          ev.stopPropagation()
        }
      }
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

      let { filePath } = await ipcRenderer.invoke('dialog.showSaveDialog', {
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
  --action-bar-height: 84px
  --game-setup-header-height: 72px

  @media #{map-get($display-breakpoints, 'lg-and-down')}
    --aside-width: 250px
    --aside-width-plus-gap: #{250px + $panel-gap}

  @media #{map-get($display-breakpoints, 'md-and-down')}
    --aside-width: 210px
    --aside-width-plus-gap: #{210px + $panel-gap}

  @media (max-height: 768px)
    --action-bar-height: 60px
    --game-setup-header-height: 50px

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

#theme-resources, #symbols
  display: none
</style>
