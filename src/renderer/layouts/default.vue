<template>
  <v-app>
    <nuxt />
    <v-dialog
      v-model="showAbout"
      max-width="600"
    >
      <AboutDialog />
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
  </v-app>
</template>

<script>
import fs from 'fs'
import { webFrame, remote, shell } from 'electron'
import { mapState } from 'vuex'

import AboutDialog from '@/components/AboutDialog'
import JoinGameDialog from '@/components/JoinGameDialog'

const { app, Menu, dialog } = remote

export default {
  components: {
    AboutDialog,
    JoinGameDialog
  },

  data () {
    return {
      showAbout: false
    }
  },

  computed: {
    ...mapState({
      undoAllowed: state => state.game.undo,
    }),

    showJoinDialog: {
      get () {
       return this.$store.state.showJoinDialog
      },

      set (value) {
        this.$store.commit('showJoinDialog', value)
      }
    }
  },

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

    await this.$store.dispatch('settings/load')

    const isMac = process.platform === 'darwin'
    const template = [
      {
        label: 'Session',
        submenu: [
          { id: 'new-game', label: 'New Game', accelerator: 'CommandOrControl+N', click: this.newGame },
          { id: 'join-game', label: 'Join Game', accelerator: 'CommandOrControl+J', click: this.joinGame },
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
          { label: 'Rules (WikiCarpedia)', click: this.showRules },
          { type: 'separator' },
          { label: 'About', click: this.about }
        ]
      }
    ]
    if ( this.$store.state.settings.devMode) {
      template.push({
        label: 'Dev',
        submenu: [
          { role: 'toggleDevTools', label: 'Toggle DevTools' },
          { label: 'Change clientId', click: this.changeClientId },
          //{ label: 'Relaunch electron', accelerator: 'CommandOrControl+E', click: () => app.exit(250) }
        ]
      })
    }

    this.menu = Menu.buildFromTemplate(template)
    this.updateMenu()
    Menu.setApplicationMenu(this.menu)

    this.$store.dispatch('checkJavaVersion')
    this.$store.dispatch('checkEngineVersion')
    this.$store.dispatch('loadPlugins')

    window.addEventListener('keydown', this.onKeyDown)
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
      this.menu.getMenuItemById('new-game').enabled = !gameOpen
      this.menu.getMenuItemById('join-game').enabled = !gameOpen
      this.menu.getMenuItemById('leave-game').enabled = gameOpen
      this.menu.getMenuItemById('save-game').enabled = gameRunning
      this.menu.getMenuItemById('load-game').enabled = !gameOpen
      this.menu.getMenuItemById('undo').enabled = gameRunning && this.undoAllowed
      this.menu.getMenuItemById('zoom-in').enabled = gameRunning
      this.menu.getMenuItemById('zoom-out').enabled = gameRunning
    },

    newGame () {
      this.$store.dispatch('gameSetup/newGame')
    },

    joinGame () {
      this.showJoinDialog = true
    },

    leaveGame () {
      this.$store.dispatch('game/close')
      this.$router.push('/')
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
      this.$store.commit('board/changeZoom', 2)
    },

    zoomOut () {
      this.$store.commit('board/changeZoom', -2)
    },

    showRules () {
      shell.openExternal('http://wikicarpedia.com/index.php/Main_Page')
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
    },

    changeClientId () {
      const [ base, suffix = '0'] = this.$store.state.settings.clientId.split('--', 2)
      const newId = `${base}--${~~suffix + 1}`
      this.$store.commit('settings/clientId', newId)
      console.log(`Client id changed to ${newId}`)
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
