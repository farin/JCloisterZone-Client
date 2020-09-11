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
        <v-btn large color="secondary" @click="createGame">
          New game
        </v-btn>

        <v-btn large color="secondary" @click="loadGame">
          Load game
        </v-btn>
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
import { mapGetters, mapState } from 'vuex'
import { shell } from 'electron'

export default {
  components: {
  },

  data () {
    return {
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
      download: state => state.download
    })
  },

  methods: {
    createGame () {
      this.$store.dispatch('game/create')
      this.$router.push('/game-setup')
    },

    async loadGame () {
      if (await this.$store.dispatch('game/load')) {
        this.$router.push('/open-game')
      }
    },

    openLink (href) {
      shell.openExternal(href)
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

main
  flex: 1
  display: flex
  justify-content: center
  align-items: center

  .v-btn
    margin: 0 30px

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
