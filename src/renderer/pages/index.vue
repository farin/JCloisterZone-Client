<template>
  <div class="landing-view view">
    <div class="ribbon">Beta</div>
    <div class="disclaimer">
      <div class="disclaimer-content">
        <p>The new JCloisterZone client still missing several important features.</p>
        <ul>
          <li>play through public server (just direct connections between clients are possible)</li>
          <li>AI</li>
          <li>localization</li>
          <li>artwork plugins</li>
          <li>game hints (farm hints, projected points…)</li>
        </ul>
      </div>
    </div>
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
      <div v-if="download">
        {{ download.description }}
        <v-progress-linear indeterminate />
      </div>
      <div v-if="updateInfo" class="update-box">
        <h3>New JCloisterZone version is avaialable.</h3>

        <div class="update-action">
          <template v-if="isMac">
            Automatic updates are not supported on Mac platform. Please update manually<br>
            <a :href="updateInfoFile">{{ updateInfoFile }}</a>
          </template>
          <v-btn v-else-if="!updating" color="secondary" @click="updateApp">Update to {{ updateInfo.version }}</v-btn>
          <v-progress-linear v-else indeterminate />
        </div>

        <h4>Release Notes</h4>
        <div v-html="updateInfo.releaseNotes" />
      </div>
    </div>

    <section class="online-hosted">
      <h2>Public server hosted</h2>

      <v-btn large color="secondary" @click="playOnline()">
        Play online
        <v-icon right>fa-cloud</v-icon>
      </v-btn>
    </section>

    <section class="player-hosted">
      <h2>User hosted</h2>

      <div class="player-hosted-content">
        <div>
          <v-btn large color="secondary" @click="newGame()">
            New game
          </v-btn>

          <template v-if="recentGameSetups.length && $store.state.loaded.plugins">
            <h3>Recent Game Setups</h3>

            <div class="recent-list d-flex flex-column align-end">
              <div
                v-for="(setup, idx) in recentGameSetups"
                :key="idx"
                class="recent-setup"
                @click="loadSetup(setup)"
              >
                <GameSetupOverviewInline :sets="setup.sets" :elements="setup.elements" />
              </div>
              <a class="clear" href="#" @click="clearRecentGameSetups"><v-icon>fas fa-times</v-icon> clear list</a>
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

          <template v-if="recentGames.length">
            <h3>Recent games</h3>

            <div class="recent-list">
              <a v-for="file in recentGames" :key="file" href="#" @click="loadGame(file)">{{ file }}</a>
              <a class="clear" href="#" @click="clearRecentGames"><v-icon>fas fa-times</v-icon> clear list</a>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { shell, ipcRenderer } from 'electron'

import mapKeys from 'lodash/mapKeys'
import { mapState } from 'vuex'

import GameSetupOverviewInline from '@/components/game-setup/overview/GameSetupOverviewInline'

const isMac = process.platform === 'darwin'

export default {
  components: {
    GameSetupOverviewInline
  },

  data () {
    return {
      isMac,
      // do not bind it to store
      recentGames: [...this.$store.state.settings.recentSaves],
      recentGameSetups: [...this.$store.state.settings.recentGameSetups],
      updating: false
    }
  },

  computed: {
    ...mapState({
      javaSelectedByUser: state => state.settings.javaPath,
      java: state => state.java,
      engine: state => state.engine,
      download: state => state.download,
      settingsLoaded: state => state.loaded.settings,
      updateInfo: state => state.updateInfo
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
      this.recentGames = [...this.$store.state.settings.recentSaves]
      this.recentGameSetups = [...this.$store.state.settings.recentGameSetups]
    }
  },

  methods: {
    newGame () {
      this.$store.dispatch('gameSetup/newGame')
    },

    joinGame () {
      this.$store.commit('showJoinDialog', true)
    },

    playOnline () {
      this.$store.dispatch('networking/connectPlayOnline')
    },

    async loadGame (file) {
      try {
        await this.$store.dispatch('game/load', file)
      } catch {
        await this.$store.dispatch('settings/validateRecentSaves')
        this.recentGames = [...this.$store.state.settings.recentSaves]
      }
    },

    async loadSetup (setup) {
      this.$store.commit('gameSetup/setup', {
        ...setup,
        sets: mapKeys(setup.sets, (val, key) => key.split(':')[0])
      })
      this.$router.push('/game-setup')
    },

    openLink (href) {
      shell.openExternal(href)
    },

    clearRecentGames () {
      this.$store.dispatch('settings/clearRecentSaves')
      this.recentGames = []
    },

    clearRecentGameSetups () {
      this.$store.dispatch('settings/clearRecentGameSetups')
      this.recentGameSetups = []
    },

    updateApp () {
      this.updating = true
      ipcRenderer.send('do-update')
    }
  }
}
</script>

<style lang="sass" scoped>
.landing-view
  position: relative
  display: flex
  flex-direction: column

  .ribbon
    position: absolute
    width: 320px
    left: -120px
    top: 40px
    background-color: #AD1457
    color: white
    text-transform: uppercase
    text-align: center
    padding: 4px 0 4px 10px
    transform: rotate(-45deg)
    font-size: 14px

  .disclaimer
    padding: 10px 0
    margin-bottom: 40px
    font-size: 12px

    #app.theme--light &
      background-color: #D7CCC8
      box-shadow: 0px 3px 7px 0px rgba(0,0,0,0.1)

    #app.theme--dark &
      background-color: #282c34
      box-shadow: 0px 3px 7px 0px rgba(255,255,255,0.1)

  .disclaimer-content
    max-width: 600px
    margin: 0 auto

    p
      font-size: 14px

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
  padding: 20px 20px 25px
  text-align: center

  +theme using ($theme)
    background: map-get($theme, 'board-bg')

  .v-btn i
    margin-left: 20px

.player-hosted
  flex: 1 0
  padding-top: 30px
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
    margin-bottom: 10px
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.10), 0 3px 10px 0 rgba(0, 0, 0, 0.03)

    +theme using ($theme)
      border: 1px solid #{map-get($theme, 'line-color')}

  .recent-list a
    display: block

    +theme using ($theme)
      &:hover
        color: map-get($theme, 'text-color')

    &.clear
      margin-top: 10px
      font-size: 14px

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

@media (max-height: 1199px)
  .landing-view
    .disclaimer-box
      margin-top: 20px
      margin-bottom: 20px

</style>

<style lang="sass">
.landing-view .v-alert__content
  text-align: center

  a
    color: white
</style>
