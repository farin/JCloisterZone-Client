<template>
  <div class="landing-view view">
    <v-select
      class="locale"
      v-model="locale"
      :items="locales"
      @input="setLocale"
      return-object
      single-line
    >
      <template slot="selection" slot-scope="data">
        <svg class="flag" v-if="data.item.flag" :width="18" :height="12">
          <use :href="`${FLAGS_SVG}#${data.item.flag}`" />
        </svg>
        {{ data.item.text }}
      </template>
      <template slot="item" slot-scope="data">
        <svg class="flag" v-if="data.item.flag" :width="18" :height="12">
          <use :href="`${FLAGS_SVG}#${data.item.flag}`" />
        </svg>
        {{ data.item.text }}
      </template>
    </v-select>
.    <div>
      <v-alert v-if="java && java.error === 'not-found' && !javaSelectedByUser" type="warning">
        {{ $t('settings.java.unable-to-find-java') }}<br>
        <br>
        {{ $t('settings.java.java-is-required') }}<br>
        <a href="#" @click="openLink('https://www.oracle.com/java/technologies/javase-jdk14-downloads.html')">{{ $t('settings.java.download-java') }}</a><br>
        <i18n tag="span" path="settings.java.verify">
          <template #settings>
            <a href @click.prevent="() => $store.commit('showSettings', true)">{{ $t('settings.title') }}</a>
          </template>
        </i18n>
      </v-alert>
      <v-alert v-if="java && java.error === 'not-found' && javaSelectedByUser" type="warning">
        {{ $t('settings.java.java-path-is-not-valid') }}<br>
        <br>
        <i18n tag="span" path="settings.java.change-in-settings">
          <template #settings>
            <a href @click.prevent="() => $store.commit('showSettings', true)">{{ $t('settings.title') }}</a>
          </template>
        </i18n>
      </v-alert>
      <v-alert v-if="java && java.error === 'outdated'" type="warning">
        {{ $t('settings.java.java-is-outdated') }}<br>
        <br>
        {{ $t('settings.java.java-version-found', { version: java.version } ) }}
        <br>
        <a href="#" @click="openLink('https://www.oracle.com/java/technologies/javase-jdk14-downloads.html')">{{ $t('settings.java.download-java') }}</a><br>
        <i18n tag="span" path="settings.java.select-manually">
          <template #settings>
            <a href @click.prevent="() => $store.commit('showSettings', true)">{{ $t('settings.title') }}</a>
          </template>
        </i18n>
      </v-alert>
      <v-alert v-if="engine && engine.error === 'not-found'" type="warning">
        <i18n tag="span" path="settings.engine.engine-path-not-exists">
          <template #path>
            <i>{{ engine.path }}</i>
          </template>
        </i18n>
      </v-alert>
      <v-alert v-if="engine && engine.error === 'exec-error'" type="warning">
        {{ $t('settings.engine.unable-to-spawn-game-engine') }}<br>
        <small>{{ engine.errorMessage }}</small>
      </v-alert>
      <v-alert v-if="artworksLoaded && !hasClassicAddon" type="warning">
        {{ $t('settings.add-ons.artwork-not-found-internet-connection-is-needed') }}<br>
        {{ $t('settings.add-ons.please-check-connectivity-and-restart-app') }}<br>
        <small>{{ $t('settings.add-ons.add-on-url') }}: <a :href="$addons.getDefaultArtworkUrl()" @click.prevent="openLink($addons.getDefaultArtworkUrl())">>{{ $addons.getDefaultArtworkUrl() }}</a></small>
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
        <h3>{{ $t('index.new-version-available') }}</h3>

        <div class="update-action">
          <template v-if="isMac || isWin">
            {{ $t('index.automatic-updates-linux-only') }}<br>
            <a :href="updateInfoFile">{{ updateInfoFile }}</a>
          </template>
          <v-btn v-else-if="!updating" color="secondary" @click="updateApp">{{ $t('index.update-to', { version: updateInfo.version }) }}</v-btn>
          <v-progress-linear v-else-if="updateProgres === null" indeterminate />
          <v-progress-linear v-else :value="updateProgress" />
        </div>

        <h4>{{ $t('index.release-notes') }}</h4>
        <div v-html="updateInfo.releaseNotes" />
      </div>
    </div>

    <section class="online-hosted">
      <div>
        <h2>{{ $t('index.online.title') }}</h2>
        <v-btn large color="secondary" :disabled="!engine || !engine.ok" @click="playOnline()">
          {{ $t('button.play-online') }}
          <v-icon right>fa-cloud</v-icon>
        </v-btn>
        <div class="subsection">
          {{ $t('index.online.private-games-only') }}<br>({{ $t('index.online.no-random-discovery') }})
        </div>
      </div>
    </section>

    <section class="player-hosted">
      <h2>{{ $t('index.local.title') }}</h2>

      <div class="subsection">
        <v-btn large color="secondary" @click="newGame()">
          {{ $t('index.local.new-game') }}
        </v-btn>

        <v-btn large color="secondary" :disabled="!engine || !engine.ok" @click="joinGame()">
          {{ $t('button.join-game') }}
        </v-btn>

        <v-btn large color="secondary" :disabled="!engine || !engine.ok" @click="loadGame()">
          {{ $t('index.local.load-game') }}
        </v-btn>
      </div>

      <div class="subsection">
        {{ $t('index.local.create-directly-from') }} <a class="my-list" @click="newGame(0)"><v-icon>far fa-heart</v-icon> {{ $t('index.local.my-favorites') }}</a>
      </div>

      <div v-if="recentSaves.length" class="subsection">
        {{ $t('index.local.continue-with-recently-saved-games') }}

        <div class="recent-list">
          <a v-for="save in recentSaves" :key="save" href="#" @click="loadSavedGame(save)">{{ save }}</a>
          <a class="clear" href="#" @click="clearRecentSaves"><v-icon>fas fa-times</v-icon> {{ $t('button.clear-list') }}</a>
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

const FLAGS_SVG = require('~/assets/flags.svg')

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
      menuItemIdx: null,
      FLAGS_SVG,
      locales: [
//        {
//          value: 'ca',
//          flag: 'catalonia',
//          text: 'Català'
//        },
        {
          value: 'cs',
          flag: 'czechia',
          text: 'Čeština'
        },
        {
          value: 'de',
          flag: 'germany',
          text: 'Deutsch'
        },
        {
          value: 'en',
          flag: 'great-britain',
          text: 'English'
        },
//        {
//          value: 'es',
//          flag: 'spain-civil',
//          text: 'Español'
//        },
        {
          value: 'fr',
          flag: 'france',
          text: 'Français'
        },
//        {
//          value: 'lv',
//          flag: 'latvia',
//          text: 'Latviešu'
//        },
        {
          value: 'nl',
          flag: 'nederland',
          text: 'Nederlands'
        },
        {
          value: 'pl',
          flag: 'poland',
          text: 'Polski',
        },
        {
          value: 'ro',
          flag: 'romania',
          text: 'Română'
        },
//        {
//          value: 'ru',
//          flag: 'russia-anti-war',
//          text: 'Русский'
//        },
        {
          value: 'sk',
          flag: 'slovakia',
          text: 'Slovensky'
//        },
//        {
//          value: 'zh',
//          flag: 'china',
//          text: '简体中文'
        }
      ]
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
    },
    
    locale: {
      get () { return this.$store.state.settings['locale'] },
      set (val) { this.$store.dispatch('settings/update', { 'locale': val.value }) }
    }
    
  },

  watch: {
    settingsLoaded () {
      this.recentSaves = [...this.$store.state.settings.recentSaves]
      this.$i18n.setLocale(this.$store.state.settings['locale'])
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
    },
    
    setLocale(event) {
      this.$i18n.setLocale(event.value)
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
  display: flex
  flex-direction: column
  align-items: center

  a
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

.v-select
  max-width: 50vw
  margin: 0 auto

.flag
  margin-left: 1ex
  margin-right: 1ex

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
