<template>
  <div class="online-page">
    <header>
      <span class="text">Connected to {{ playOnlineHostname }}</span>

      <v-btn large color="primary" @click="createGame()">
        Create Game
      </v-btn>

      <v-btn large color="primary" @click="openJoinGameDialog()">
        Join Game
      </v-btn>

      <v-btn large color="secondary" @click="disconnect()">
        Disconnect
      </v-btn>
    </header>
    <main>
      <h2>My Games</h2>

      <div v-if="!vefiriedGameList.length" class="empty-message">
        <i>You have no unfinished game.</i>
      </div>

      <div class="game-list">
        <div
          v-for="{ game, valid } in vefiriedGameList"
          :key="game.gameId"
          class="game"
        >
          <div class="game-header">
            <span class="game-key">{{ game.key.substring(0,3) }}-{{ game.key.substring(3) }}</span>
            <span class="game-started">{{ game.started | formatDate }}</span>
          </div>

          <div :class="{ invalid: !valid }">
            <GameSetupOverviewInline :sets="game.setup.sets" :elements="game.setup.elements" />
          </div>

          <div class="buttons">
            <v-btn color="primary" :disabled="!valid" @click="resume(game)"><v-icon left>fa-play</v-icon> Resume</v-btn>
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

    <v-dialog
      v-model="showJoinDialog"
      max-width="400px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Join Game</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <p>Paste a game key provided by host</p>
            <v-text-field v-model="joinGameId" label="Game ID" @keydown.enter="joinGame" />
            <v-alert
              v-if="joinError"
              type="error"
              dense
            >
              {{ joinError }}
            </v-alert>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showJoinDialog = false">Cancel</v-btn>
          <v-btn text @click="joinGame">Confirm</v-btn>
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
      showDeleteGameId: null,
      showJoinDialog: false,
      joinGameId: '',
      joinError: null
    }
  },

  computed: {
    ...mapState({
      gameList: state => state.online.gameList,
      playOnlineHostname: state => state.settings.playOnlineUrl.split('/')[0]
    }),

    ...mapGetters({
    }),

    vefiriedGameList () {
      return this.gameList.map(game => {
        const edition = game.setup.elements.garden ? 2 : 1
        const valid = !this.$tiles.getExpansions(game.setup.sets, edition)._UNKNOWN
        return { game, valid }
      })
    }
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

    openJoinGameDialog () {
      this.joinGameId = ''
      this.showJoinDialog = true
    },

    joinGame () {
      this.joinError = null
      this.$connection.onNextSendError(err => {
        this.joinError = err.message
      })
      this.$connection.send({ type: 'JOIN_GAME', payload: { gameKey: this.joinGameId } })
    },

    disconnect () {
      this.$store.dispatch('networking/close')
      this.$router.push('/')
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

  .invalid
    opacity: 0.4

  .buttons
    margin: 0 20px

    .v-btn
      margin-right: 10px

  +theme using ($theme)
    color: map-get($theme, 'cards-text')
    background-color: map-get($theme, 'cards-bg')

  .game-header
    display: flex
    justify-content: space-between
    margin: -8px 8px 8px
    font-weight: 300
    font-size: 16px
    text-transform: uppercase

    +theme using ($theme)
      color: map-get($theme, 'gray-text-color')

.empty-message
  margin: 30px 0
  text-align: center
</style>
