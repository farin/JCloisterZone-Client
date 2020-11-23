<template>
  <div class="online-page">
    <header>
      <span class="text">Connected to play.jcloisterzone.com</span>

      <v-btn large color="secondary" @click="createGame()">
        Create Game
      </v-btn>
    </header>
    <main>
      <h2>Started Games</h2>
    </main>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  components: {
  },

  data () {
    return {
    }
  },

  computed: {
    ...mapState({
    }),

    ...mapGetters({
    })
  },

  beforeCreate () {
    // useful for dev mode, reload on this page redirects back to home
    // if (!this.$connection.isConnectedOrConnecting()) {
    //   this.$store.dispatch('game/close')
    //   this.$router.push('/')
    // }
  },

  mounted () {
    this.$connection.on('close', this._onClose = () => {
      // TODO print message
      this.$router.push('/')
    })
  },

  beforeDestroy () {
    this._onClose && this.$connection.off('close', this._onClose)
  },

  methods: {
    createGame () {
      this.$store.dispatch('gameSetup/newGame')
    }
  }
}
</script>

<style lang="sass" scoped>
.online-page
  min-height: 100vh

  +theme using ($theme)
    background: map-get($theme, 'board-bg')

header
  height: $action-bar-height
  display: flex
  align-items: center
  justify-content: center

  +theme using ($theme)
    background-color: map-get($theme, 'cards-bg')
    color: map-get($theme, 'gray-text-color')

    .text
      font-size: 20px
      font-weight: 300

  .v-btn
    margin-left: 30px

h2
  font-weight: 300
  font-size: 16px
  text-transform: uppercase
  text-align: center
  margin-top: 30px

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')
</style>
