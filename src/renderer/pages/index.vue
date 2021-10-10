<template>
  <div class="landing-view view">
    <div @click="$i18n.setLocale('cs')">CS</div>
    <div @click="$i18n.setLocale('en')">EN</div>

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
        Plese check your connectivity and restart app to try it again.<br>
        <small>addon url: <a :href="$addons.getDefaultArtworkUrl()" @click.prevent="openLink($addons.getDefaultArtworkUrl())">>{{ $addons.getDefaultArtworkUrl() }}</a></small>
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
        <h2>{{ $t('online.title') }}</h2>
        <v-btn large color="secondary" :disabled="!engine || !engine.ok" @click="playOnline()">
          {{ $t('online.play_online_button') }}
          <v-icon right>fa-cloud</v-icon>
        </v-btn>
        <div class="subsection">
          Only private games are now supported.<br>(it means no random players discovery)
        </div>
      </div>
    </section>

    <section class="player-hosted">
      <h2>Player hosted games</h2>

      <div class="subsection">
        <v-btn large color="secondary" @click="newGame()">
          New game
        </v-btn>

        <v-btn large color="secondary" :disabled="!engine || !engine.ok" @click="joinGame()">
          Join game
        </v-btn>

        <v-btn large color="secondary" :disabled="!engine || !engine.ok" @click="loadGame()">
          Load game
        </v-btn>
      </div>

      <div class="subsection">
        or create a new game directly from <a class="my-list" @click="newGame(0)"><v-icon>far fa-heart</v-icon> my favorites</a>
      </div>

      <div v-if="recentSaves.length" class="subsection">
        or continue with recently saved game

        <div class="recent-list">
          <a v-for="save in recentSaves" :key="save" href="#" @click="loadSavedGame(save)">{{ save }}</a>
          <a class="clear" href="#" @click="clearRecentSaves"><v-icon>fas fa-times</v-icon> clear list</a>
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
    }
  },

  methods: {
    newGame (tab) {
      this.$store.dispatch('gameSetup/newGame')
      this.$router.push('/game-setup' + (tab !== undefined ? `?tab=${tab}` : ''))
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
        await this.$store.dispatch('game/load', { file })
      } catch {
        await this.$store.dispatch('settings/validateRecentSaves')
        this.recentSaves = [...this.$store.state.settings.recentSaves]
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

    updateApp () {
      this.updating = true
      ipcRenderer.send('do-update')
    },

    afterAddonsReloaded () {
      // DEL ?
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

h2
  font-weight: 300

h2
  font-size: 26px
  margin: 0 0 20px

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')

.v-alert
  margin-bottom: 0

.subsection
  font-weight: 300
  font-size: 16px
  margin-top: 30px

  .v-btn
    margin: 0 20px

.my-list
  display: inline-block
  margin-top: 10px
  font-size: 16px

  &:hover
    text-decoration: underline

  i
    color: inherit !important
    font-size: inherit !important

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

  p
    margin-top: 30px

.player-hosted
  padding: 30px 0
  text-align: center

  h2
    margin-bottom: 40px

  .player-hosted-content
    display: flex
    justify-content: center
    align-items: stretch

    > div
      flex: 1

.recent-list
  margin-top: 4px

  a
    display: block

    +theme using ($theme)
      &:hover
        color: map-get($theme, 'text-color')

    &.clear
      font-size: 14px
      margin-top: 10px

      i
        color: inherit !important
        font-size: inherit !important

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
