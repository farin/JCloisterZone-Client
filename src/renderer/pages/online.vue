<template>
  <div class="online-page">
    <header>
      <span class="text">Connected to play.jcloisterzone.com</span>

      <v-btn large color="primary" @click="createGame()">
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
          <GameSetupOverviewInline :sets="game.setup.sets" :elements="game.setup.elements" />

          <div class="buttons">
            <v-btn color="primary" @click="resume(game)"><v-icon left>fa-play</v-icon> Resume</v-btn>
            <v-btn color="secondary" @click="del(game)"><v-icon>fa-trash-alt</v-icon></v-btn>
          </div>
        </div>
      </div>
    </main>

    <v-dialog
      v-model="showDeleteDialog"
      persistent
      max-width="400px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Abandon game</span>
        </v-card-title>
        <v-card-text>
          Do you want to permanently remove unfinished game from your list?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="showDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            text
            @click="delConfirm()"
          >
            Remove
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import GameSetupOverviewInline from '@/components/game-setup/overview/GameSetupOverviewInline'

export default {
  components: {
    GameSetupOverviewInline
  },

  data () {
    return {
      showDeleteDialog: false,
      showDeleteGameId: null
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
    if (!this.$connection.isConnectedOrConnecting()) {
      this.$router.push('/')
    }
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
      this.$router.push('/game-setup')
    },

    resume (game) {
      this.$connection.send({ type: 'JOIN_GAME', payload: { gameId: game.gameId } })
    },

    del (game) {
      this.showDeleteDialog = true
      this.showDeleteGameId = game.gameId
    },

    async delConfirm () {
      this.showDeleteDialog = false
      await this.$connection.send({ type: 'ABANDON_GAME', payload: { gameId: this.showDeleteGameId } })
      await this.$connection.send({ type: 'LIST_GAMES', payload: {} })
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
  height: var(--action-bar-height)
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
  width: 380px
  padding: 20px 10px
  margin: 10px
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15), 0 3px 10px 0 rgba(0, 0, 0, 0.10)

  .buttons
    margin: 0 20px

    .v-btn
      margin-right: 10px

  +theme using ($theme)
    color: map-get($theme, 'cards-text')
    background-color: map-get($theme, 'cards-bg')
</style>
