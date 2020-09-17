<template>
  <div class="landing-view view">
    <div class="ribbon">Development Preview</div>
    <div class="disclaimer-box">
      <v-card>
        <v-card-title>Development Preview</v-card-title>
        <v-card-text class="text--primary">
          <p>This JCloisterZone client builld still missing several important features.</p>
          <ul>
            <li>networking (just local game is allowed now)</li>
            <li>game clock</li>
            <li>settings</li>
            <li>AI</li>
            <li>localization</li>
            <li>more artwork plugins</li>
            <li>game hints (farm hints, projected points ...)</li>
          </ul>
        </v-card-text>
      </v-card>
    </div>
    <div>
      <v-alert v-if="javaMissing" type="warning">
        Unable to locate Java on your system.<br>
        <br>
        Java is required to start a game.<br>
        <a href="#" @click="openLink('https://www.oracle.com/java/technologies/javase-jdk14-downloads.html')">Download Java</a>
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
        <v-btn large color="secondary" @click="createGame()">
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
        <v-btn large color="secondary" @click="loadGame()">
          Load game
        </v-btn>

        <template v-if="recentGames.length">
          <h2 >Recent games</h2>

          <div class="recent-list">
            <a v-for="file in recentGames" :key="file" href="#" @click="loadGame(file)">{{ file }}</a>
            <a class="clear" href="#" @click="clearRecentGames"><v-icon>fas fa-times</v-icon> clear list</a>
          </div>
        </template>

      </div>
    </main>
    <footer>
      <span v-if="java !== null">
        Java version  {{ java === false ? 'not available' : java.version }}
      </span>
    </footer>
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
    createGame () {
      this.$store.dispatch('game/create')
      this.$router.push('/game-setup')
    },

    async loadGame (file) {
      try {
        const save = await this.$store.dispatch('game/load', file)
        this.$router.push(save.test ? '/game' : '/open-game')
      } catch {
        await this.$store.dispatch('settings/validateRecentSaves')
        this.recentGames = [...this.$store.state.settings.recentSaves]
      }
    },

    async loadSetup (setup) {
      this.$store.dispatch('game/create')
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
    left: -90px
    top: 60px
    background-color: #AD1457
    color: white
    text-transform: uppercase
    padding: 10px 80px
    transform: rotate(-45deg)

  .disclaimer-box
    max-width: 600px
    margin: 0 auto
    margin-top: 100px
    margin-bottom: 40px
    border: 1px solid #AD1457

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
    border-right: 1px solid #eee
    text-align: right

  h2
    color: $color-gray
    font-weight: 300
    font-size: 16px
    text-transform: uppercase
    margin-top: 30px
    margin-bottom: 10px

  .recent-setup
    cursor: pointer
    margin-bottom: 10px
    border: 1px solid black

  &:hover
    box-shadow: 0px 0px 4px 0px $primary-color


  .recent-list a
    display: block

    &:hover
      color: black

    &.clear
      margin-top: 10px
      font-size: 14px

      i
        color: inherit !important
        font-size: inherit !important

footer
  font-size: 14px
  text-align: right
  padding: 1px 2px
</style>

<style lang="sass">
.landing-view .v-alert__content
  text-align: center

  a
    color: white
</style>
