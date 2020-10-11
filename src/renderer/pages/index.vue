<template>
  <div class="landing-view view">
    <div class="ribbon">Beta</div>
    <div class="disclaimer">
      <div class="disclaimer-content">
        <p>The new JCloisterZone client still missing several important features.</p>
        <ul>
          <li>play through public server (just direct connection between clints is possible)</li>
          <li>game clock</li>
          <li>AI</li>
          <li>localization</li>
          <li>artwork plugins</li>
          <li>game hints (farm hints, projected points ...)</li>
        </ul>
      </div>
    </div>
    <div>
      <v-alert v-if="javaMissing && !javaSelectedByUser" type="warning">
        Unable to locate Java on your system.<br>
        <br>
        Java is required to start a game.<br>
        <a href="#" @click="openLink('https://www.oracle.com/java/technologies/javase-jdk14-downloads.html')">Download Java</a>
      </v-alert>
      <v-alert v-if="javaMissing && javaSelectedByUser" type="warning">
        Your manually configured path to Java binary is not valid.<br>
        <br>
        Change it in settings.
      </v-alert>
      <v-alert v-if="javaOutdated" type="warning">
        You Java installation is outdated.<br>
        <br>
        Java 11 or higher is required (found {{ java.version }}).<br>
        Java is required to start a game.<br>
        <a href="#" @click="openLink('https://www.oracle.com/java/technologies/javase-jdk14-downloads.html')">Download Java</a>
      </v-alert>
      <v-alert v-if="engineMissing" type="warning">
        JCloisterZone Game Engine is missing.
      </v-alert>

      <div v-if="download" class="download-box">
          {{ download.description }}
          <v-progress-linear indeterminate />
      </div>
    </div>
    <main>
      <div>
        <v-btn large color="secondary" @click="newGame()">
          New game
        </v-btn>

        <template v-if="recentGameSetups.length">
          <h2>Recent Game Setups</h2>

          <div class="recent-list d-flex flex-column align-end">
            <div
              v-for="(setup, idx) in recentGameSetups"
              :key="idx"
              class="recent-setup"
              @click="loadSetup(setup)"
            >
              <GameSetupOverviewInline  :sets="setup.sets" :elements="setup.elements" />
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
          <h2>Recent games</h2>

          <div class="recent-list">
            <a v-for="file in recentGames" :key="file" href="#" @click="loadGame(file)">{{ file }}</a>
            <a class="clear" href="#" @click="clearRecentGames"><v-icon>fas fa-times</v-icon> clear list</a>
          </div>
        </template>

      </div>
    </main>
    <!-- <footer>
    </footer> -->
  </div>
</template>

<script>
import { shell } from 'electron'

import mapKeys from 'lodash/mapKeys'
import { mapGetters, mapState } from 'vuex'

import GameSetupOverviewInline from '@/components/game-setup/overview/GameSetupOverviewInline'

export default {
  components: {
    GameSetupOverviewInline
  },

  data () {
    return {
      // do not bind it to store
      recentGames: [...this.$store.state.settings.recentSaves],
      recentGameSetups: [...this.$store.state.settings.recentGameSetups]
    }
  },

  computed: {
    ...mapGetters({
      javaMissing: 'javaMissing',
      javaOutdated: 'javaOutdated',
      engineMissing: 'engineMissing'
    }),

    ...mapState({
      javaSelectedByUser: state => state.settings.javaPath,
      java: state => state.java,
      engine: state => state.engine,
      download: state => state.download,
      settingsLoaded: state => state.loaded.settings
    })
  },

  watch: {
    settingsLoaded () {
      this.recentGames = [...this.$store.state.settings.recentSaves],
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
        sets: mapKeys(setup.sets, (val, key) => key.split(":")[0])
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
    position: fixed
    width: 320px
    left: -90px
    top: 60px
    background-color: #AD1457
    color: white
    text-transform: uppercase
    text-align: center
    padding: 10px 80px
    transform: rotate(-45deg)

  .disclaimer
    padding: 20px 0
    margin-bottom: 40px

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
      font-size: 18px

main
  flex: 1 0
  display: flex
  justify-content: center
  align-items: stretch
  padding-top: 40px

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

  h2
    font-weight: 300
    font-size: 16px
    text-transform: uppercase
    margin-top: 30px
    margin-bottom: 10px

    +theme using ($theme)
      color: map-get($theme, 'gray-text-color')

  .recent-setup
    cursor: pointer
    margin-bottom: 10px

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

// footer
//   font-size: 14px
//   text-align: right
//   padding: 1px 2px

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
