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

      <div class="game-list">
        <div
          v-for="game in gameList"
          :key="game.gameId"
          class="game"
        >
          {{ game.gameId }}

          <v-btn large color="secondary" @click="resume(game)">Resume</v-btn>
        </div>
      </div>
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
      gameList: state => state.online.gameList
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

    this.$connection.send({ type: 'LIST_GAMES', payload: {} })
  },

  beforeDestroy () {
    this._onClose && this.$connection.off('close', this._onClose)
  },

  methods: {
    createGame () {
      this.$store.dispatch('gameSetup/newGame')
    },

    resume (game) {
      this.$connection.send({ type: 'JOIN_GAME', payload: { gameId: game.gameId } })
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

.game-list
  padding: 0 20px
  display: flex
  flex-wrap: wrap

.game
  width: 300px
  padding: 20px
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15), 0 3px 10px 0 rgba(0, 0, 0, 0.10)

  +theme using ($theme)
    color: map-get($theme, 'cards-text')
    background-color: map-get($theme, 'cards-bg')
</style>
