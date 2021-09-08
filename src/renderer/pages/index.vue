<template>
  <div class="landing-view view">
    <div>
      <v-alert v-if="java && java.error === 'not-found' && !javaSelectedByUser" type="warning">
        Unable to locate Java on your system.<br>
        <br>
        Java is required to start a game.<br>
        <a href="#" @click="openLink('https://www.oracle.com/java/technologies/javase-jdk14-downloads.html')">Download Java</a><br>
        If Java is already installed, verify if Java is added to your system path or select java binary manually in <a href @click.prevent="() => $store.commit('showSettings', true)">settings</a>.
      </v-alert>
      <v-alert v-if="java && java.error === 'not-found' && javaSelectedByUser" type="warning">
        Your manually configured Java path is not valid.<br>
        <br>
        Change it in <a href @click.prevent="() => $store.commit('showSettings', true)">settings</a>.
      </v-alert>
      <v-alert v-if="java && java.error === 'outdated'" type="warning">
        You Java installation is outdated.<br>
        <br>
        Java 11 or higher is required (found {{ java.version }}) to start a game.<br>
        <a href="#" @click="openLink('https://www.oracle.com/java/technologies/javase-jdk14-downloads.html')">Download Java</a><br>
        Or select proper java manually in <a href @click.prevent="() => $store.commit('showSettings', true)">settings</a>.
      </v-alert>
      <v-alert v-if="engine && engine.error === 'not-found'" type="warning">
        Can't locate game engine (file <i>{{ engine.path }}</i> doesn't exist or can't be read)
      </v-alert>
      <v-alert v-if="engine && engine.error === 'exec-error'" type="warning">
        Unable to spawn game engine. Details:<br>
        <small>{{ engine.errorMessage }}</small>
      </v-alert>
      <v-alert v-if="artworksLoaded && !hasClassicAddon" type="warning">
        Unable to locate or download addon with default artwork. Internet conection is needed at fist run to donwload it.<br>
        Plese check your connectivity and restart app to try it again.
      </v-alert>
      <div v-if="download" class="download">
        <div class="download-header">
          <span class="description">{{ download.description }}</span>
          <span v-if="download.size" class="size">
            {{ (download.progress / 1048576).toFixed(2) }} / {{ (download.size / 1048576).toFixed(2) }} MiB
          </span>
        </div>
        <v-progress-linear
          v-if="download.size"
          :value="download.size ? download.progress / download.size * 100 : null"
        />
        <v-progress-linear v-else indeterminate />
      </div>
      <div v-if="updateInfo" class="update-box">
        <h3>New JCloisterZone version is available.</h3>

        <div class="update-action">
          <template v-if="isMac || isWin">
            Automatic updates are currently supported only on Linux platform. Please download new version directly and update manually<br>
            <a :href="updateInfoFile">{{ updateInfoFile }}</a>
          </template>
          <v-btn v-else-if="!updating" color="secondary" @click="updateApp">Update to {{ updateInfo.version }}</v-btn>
          <v-progress-linear v-else-if="updateProgres === null" indeterminate />
          <v-progress-linear v-else :value="updateProgress" />
        </div>

        <h4>Release Notes</h4>
        <div v-html="updateInfo.releaseNotes" />
      </div>
    </div>

    <section class="online-hosted">
      <div>
        <h2>Public server hosted games</h2>
        <v-btn large color="secondary" @click="playOnline()">
          Play online
          <v-icon right>fa-cloud</v-icon>
        </v-btn>
      </div>
    </section>

    <section class="player-hosted">
      <h2>Client hosted games</h2>

      <div class="player-hosted-content">
        <div>
          <v-btn large color="secondary" @click="newGame()">
            New game
          </v-btn>

          <template v-if="recentSetupSaves.length">
            <h3>Recent Setups</h3>

            <div v-if="recentSetupSaves.length" class="recent-list saved-games-list">
              <a v-for="file in recentSetupSaves" :key="file" href="#" @click.prevent="loadSavedSetup(file)">{{ file }}</a>
              <a v-if="!recentGameSetups.length" class="clear" href="#" @click.prevent="clearSetups"><v-icon>fas fa-times</v-icon> clear list</a>
            </div>
          </template>
        </div>

        <div>
          <div class="d-flex">
            <v-btn large color="secondary" @click="loadGame()">
              Load game
            </v-btn>

            <div class="join-wrapper">
              <v-btn large color="secondary" @click="joinGame()">
                Join game
              </v-btn>
            </div>
          </div>

          <template v-if="recentSaves.length">
            <h3>Recent Games</h3>

            <div class="recent-list saved-games-list">
              <a v-for="file in recentSaves" :key="file" href="#" @click="loadSavedGame(file)">{{ file }}</a>
              <a class="clear" href="#" @click="clearRecentSaves"><v-icon>fas fa-times</v-icon> clear list</a>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { shell, ipcRenderer } from 'electron'

import Vue from 'vue'
import { mapState } from 'vuex'

import AddonsReloadObserverMixin from '@/components/AddonsReloadObserverMixin'

const isMac = process.platform === 'darwin'
const isWin = process.platform === 'win32'

export default {
  components: {
  },

  mixins: [AddonsReloadObserverMixin],

  data () {
    return {
      isMac,
      isWin,
      // do not bind it to store
      recentSaves: [...this.$store.state.settings.recentSaves],
      recentSetupSaves: [...this.$store.state.settings.recentSetupSaves],
      updating: false,
      showRecentSetupMenu: false,
      menuX: null,
      menuY: null,
      menuItemIdx: null
    }
  },

  computed: {
    ...mapState({
      javaSelectedByUser: state => state.settings.javaPath,
      java: state => state.java,
      engine: state => state.engine,
      download: state => state.download,
      settingsLoaded: state => state.loaded.settings,
      artworksLoaded: state => state.loaded.artworks,
      hasClassicAddon: state => state.hasClassicAddon,
      updateInfo: state => state.updateInfo,
      updateProgress: state => state.updateProgress
    }),

    updateInfoFile () {
      if (this.updateInfo) {
        return `https://github.com/farin/JCloisterZone-Client/releases/download/v${this.updateInfo.version}/${this.updateInfo.files[0].url}`
      }
      return null
    }
  },

  watch: {
    settingsLoaded () {
      this.recentSaves = [...this.$store.state.settings.recentSaves]
      this.recentSetupSaves = [...this.$store.state.settings.recentSetupSaves]
    }
  },

  methods: {
    newGame () {
      this.$store.dispatch('gameSetup/newGame')
      this.$router.push('/game-setup')
    },

    joinGame () {
      this.$store.commit('showJoinDialog', true)
    },

    playOnline () {
      this.$store.dispatch('networking/connectPlayOnline')
    },

    loadGame () {
      this.$store.dispatch('game/load')
    },

    async loadSavedGame (file) {
      try {
        await this.$store.dispatch('game/load', file)
      } catch {
        await this.$store.dispatch('settings/validateRecentSaves')
        this.recentSaves = [...this.$store.state.settings.recentSaves]
      }
    },

    async loadSavedSetup (file) {
      try {
        await this.$store.dispatch('game/load', file)
      } catch {
        await this.$store.dispatch('settings/validateRecentSetupSaves')
        this.recentSetupSaves = [...this.$store.state.settings.recentSetupSaves]
      }
    },

    loadSetup (setup) {
      this.$store.dispatch('gameSetup/load', setup)
      this.$router.push('/game-setup')
    },

    openLink (href) {
      shell.openExternal(href)
    },

    clearRecentSaves () {
      this.$store.dispatch('settings/clearRecentSaves')
      this.recentSaves = []
    },

    clearSetups () {
      this.$store.dispatch('settings/clearRecentSetupSaves')
      this.recentSetupSaves = []
    },

    updateApp () {
      this.updating = true
      ipcRenderer.send('do-update')
    },

    afterAddonsReloaded () {
      this.verifyRecentSetups()
    },

    showRecentSetup (e, idx) {
      e.preventDefault()
      this.showRecentSetupMenu = false
      this.menuX = e.clientX
      this.menuY = e.clientY
      this.menuItemIdx = idx
      Vue.nextTick(() => {
        this.showRecentSetupMenu = true
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.landing-view
  position: relative
  display: flex
  flex-direction: column

h2, h3
  font-weight: 300
  font-size: 16px
  margin-bottom: 10px

h2
  font-size: 18px
  margin: 0 0 20px

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')

h3
  font-size: 16px
  text-transform: uppercase
  margin-top: 30px

.online-hosted
  height: 33vh
  display: flex
  justify-content: center
  align-items: center

  +theme using ($theme)
    background: map-get($theme, 'board-bg')

  > div
    text-align: center

    .v-btn i
      margin-left: 20px

.player-hosted
  flex: 1 0
  padding-top: 30px
  padding-bottom: 10px
  text-align: center

.player-hosted-content
  display: flex
  justify-content: center
  align-items: stretch
  text-align: left

  > div
    padding: 5px 30px
    flex: 1

  > div:first-child
    text-align: right

    +theme using ($theme)
      border-right: 1px solid #{map-get($theme, 'line-color')}

  .join-wrapper
    margin-left: 40px
    padding-left: 40px

    +theme using ($theme)
      border-left: 1px solid #{map-get($theme, 'line-color')}

  .recent-setup
    cursor: pointer
    padding-top: 5px
    margin-bottom: 20px
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.10), 0 3px 10px 0 rgba(0, 0, 0, 0.03)

    +theme using ($theme)
      border: 1px solid #{map-get($theme, 'line-color')}

    &.invalid
      cursor: default
      opacity: 0.4

  .recent-list a
    display: block

    +theme using ($theme)
      &:hover
        color: map-get($theme, 'text-color')

    &.clear
      font-size: 14px

      i
        color: inherit !important
        font-size: inherit !important

  .saved-games-list
    margin-bottom: 20px

    a.clear
      margin-top: 10px

  .setup-list a.clear
    margin-top: -10px

.update-box
  padding: 20px
  background-color: #FFE082
  color: black
  text-align: center

  .update-action
    margin: 20px 0

  .update-note
    font-style: italic
    margin-bottom: 10px

  ::v-deep ul
    list-style: none

.download
  padding: 0 20px

.download-header
  display: flex

  .description
    flex-grow: 1

@media (max-height: 1199px)
  .landing-view
    .disclaimer-box
      margin-top: 20px
      margin-bottom: 20px

@media (max-height: 768px)
  .player-hosted
    padding-top: 0

  .landing-view .disclaimer-content p
    margin-bottom: 8px
</style>

<style lang="sass">
.landing-view .v-alert__content
  text-align: center

  a
    color: white
</style>
