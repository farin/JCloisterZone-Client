<template>
  <v-app>
    <nuxt />
    <v-dialog
      v-model="showAbout"
      max-width="600"
    >
      <AboutDialog />
    </v-dialog>
  </v-app>
</template>

<script>
import fs from 'fs'
import { webFrame, remote } from 'electron'
import { mapState } from 'vuex'

import AboutDialog from '@/components/AboutDialog'

const { app, Menu, dialog } = remote

export default {
  components: {
    AboutDialog
  },

  data () {
    return {
      showAbout: false
    }
  },

  computed: mapState({
    undoAllowed: state => state.game.undo
  }),

  watch: {
    $route (to) {
      this.updateMenu()
    },

    undoAllowed () {
      this.updateMenu()
    }
  },

  async mounted () {
    webFrame.setZoomLevel(0)
    webFrame.setVisualZoomLevelLimits(1, 1)

    const isMac = process.platform === 'darwin'
    const template = [
      {
        label: 'Session',
        submenu: [
          { id: 'new-game', label: 'New Game', accelerator: 'CommandOrControl+N', click: this.newGame },
          { type: 'separator' },
          { id: 'leave-game', label: 'Leave Game', click: this.leaveGame },
          { type: 'separator' },
          { id: 'save-game', label: 'Save Game', accelerator: 'CommandOrControl+S', click: this.saveGame },
          { id: 'load-game', label: 'Load Game', accelerator: 'CommandOrControl+L', click: this.loadGame },
          { type: 'separator' },
          isMac ? { role: 'close' } : { role: 'quit' }
        ]
      },
      {
        label: 'Game',
        submenu: [
          { id: 'undo', label: 'Undo', accelerator: 'CommandOrControl+Z', click: this.undo },
          { type: 'separator' },
          { id: 'zoom-in', label: 'Zoom In', accelerator: 'numadd', click: this.zoomIn },
          { id: 'zoom-out', label: 'Zoom Out', accelerator: 'numsub', click: this.zoomOut }
        ]
      }, {
        label: 'Help',
        submenu: [
          { label: 'About', click: this.about },
          { type: 'separator' },
          { role: 'toggleDevTools', label: 'Toggle DevTools' },
          // { label: 'Relaunch electron', accelerator: 'CommandOrControl+E', click: () => app.exit(250) }
        ]
      }
    ]
    this.menu = Menu.buildFromTemplate(template)
    this.updateMenu()
    Menu.setApplicationMenu(this.menu)

    this.$store.dispatch('checkJavaVersion')
    this.$store.dispatch('checkEngineVersion')

    await this.$store.dispatch('settings/load')
    this.$store.dispatch('loadPlugins')

    window.addEventListener('keydown', this.onKeyDown)
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  methods: {
    updateMenu () {
      const routeName = this.$route.name
      const gameOpen = routeName === 'game-setup' || routeName === 'open-game' || routeName === 'game'
      const gameRunning = routeName === 'game'
      this.menu.getMenuItemById('new-game').enabled = !gameOpen
      this.menu.getMenuItemById('leave-game').enabled = gameOpen
      this.menu.getMenuItemById('save-game').enabled = gameRunning
      this.menu.getMenuItemById('load-game').enabled = !gameOpen
      this.menu.getMenuItemById('undo').enabled = gameRunning && this.undoAllowed
      this.menu.getMenuItemById('zoom-in').enabled = gameRunning
      this.menu.getMenuItemById('zoom-out').enabled = gameRunning
    },

    newGame () {
      this.$store.dispatch('game/create')
      this.$router.push('/game-setup')
    },

    leaveGame () {
      this.$router.push('/')
    },

    async saveGame () {
      await this.$store.dispatch('game/save')
    },

    async loadGame () {
      if (await this.$store.dispatch('game/load')) {
        this.$router.push('/open-game')
      }
    },

    undo () {
      this.$store.dispatch('game/undo')
    },

    zoomIn () {
      this.$store.commit('board/changeZoom', 2)
    },

    zoomOut () {
      this.$store.commit('board/changeZoom', -2)
    },

    about () {
      this.showAbout = true
    },

    onKeyDown (ev) {
      if (ev.key === 'Escape' && this.showAbout) {
        this.showAbout = false
        ev.preventDefault()
        ev.stopPropagation()
      }
    }
  }
}
</script>

<style lang="sass">
html
  overflow-y: auto

body
  margin: 0 !important

.view
  width: 100%
  min-height: 100vh

@import '~/assets/styles/theme.scss'
@import '~/assets/styles/rotation.sass'

.dragon
  fill: $dragon-color

.fairy
  fill: $fairy-color

.count
  fill: $count-color

.mage
  fill: $mage-color

.witch
  fill: $witch-color
</style>
