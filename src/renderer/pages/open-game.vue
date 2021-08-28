<template>
  <GameSetupGrid v-if="loaded && gameId" :sets="sets" :rules="rules">
    <template #header>
      <template v-if="isOwner">
        <HeaderGameButton
          title="Start"
          :sets="sets"
          :info="slotsAssigned ? null : (readOnly ? 'Assign all players to start' : 'No player in game')"
          @click="startGame"
        />
      </template>
      <template v-else>
        <span class="text">Waiting for host to start the game.</span>
      </template>
    </template>

    <template #main>
      <div v-if="pin" class="pin">
        <span>Share the key with other players to let them connect to the game.</span>
        <strong>{{ pin }}</strong>
      </div>

      <div class="slots">
        <PlayerSlot
          v-for="slot in slots"
          :key="slot.number"
          :number="slot.number"
          :owner="slot.sessionId"
          :name="slot.name"
          :order="slot.order"
          :read-only="readOnly"
        />
      </div>
    </template>

    <template #detail>
      <div class="options">
        <h2>Options</h2>
        <v-checkbox
          v-if="!readOnly"
          v-model="randomizeSeating"
          dense hide-details
          label="Randomize seating order"
          :disabled="!isOwner"
        />
        <v-checkbox
          v-model="puristTiles"
          dense hide-details
          label="Hide remaining tiles cheat sheet"
          :disabled="readOnly || !isOwner"
        />
      </div>

      <GameSetupOverview :setup="setup" />
    </template>
  </GameSetupGrid>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import GameSetupOverview from '@/components/game-setup/overview/GameSetupOverview'
import GameSetupGrid from '@/components/game-setup/GameSetupGrid'
import HeaderGameButton from '@/components/game-setup/HeaderGameButton'
import PlayerSlot from '@/components/game-setup/PlayerSlot'

export default {
  components: {
    GameSetupOverview,
    GameSetupGrid,
    HeaderGameButton,
    PlayerSlot
  },

  data () {
    return {
      // do not updata it after start when gameMessages are set to empty array
      readOnly: this.$store.state.game.gameMessages !== null
    }
  },

  computed: {
    ...mapState({
      pin: state => state.game.pin,
      setup: state => state.game.setup,
      sets: state => state.game.setup?.sets,
      rules: state => state.game.setup?.rules,
      gameId: state => state.game.id,
      options: state => state.game.setup?.options,
      slots: state => state.game.slots,
      isOwner: state => state.game.owner === state.networking.sessionId
    }),

    ...mapGetters({
      loaded: 'loaded'
    }),

    slotsAssigned () {
      if (this.readOnly) {
        return !this.slots.find(slot => !slot.sessionId)
      } else {
        return !!this.slots.find(slot => slot.sessionId)
      }
    },

    randomizeSeating: {
      set (value) {
        this.$store.commit('game/options', { randomizeSeating: value })
        this.$connection.send({
          type: 'GAME_OPTION',
          payload: {
            gameId: this.gameId,
            key: 'randomizeSeating',
            value
          }
        })
      },

      get () {
        return this.options.randomizeSeating
      }
    },

    puristTiles: {
      set (value) {
        this.$store.commit('game/options', { puristTiles: value })
        this.$connection.send({
          type: 'GAME_OPTION',
          payload: {
            gameId: this.gameId,
            key: 'puristTiles',
            value
          }
        })
      },

      get () {
        return this.options.puristTiles
      }
    }
  },

  beforeCreate () {
    // useful for dev mode, reload on this page redirects back to home
    if (!this.$connection.isConnectedOrConnecting()) {
      this.$store.dispatch('game/close')
      this.$router.push('/')
    }
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
    startGame () {
      this.$store.dispatch('game/start')
    }
  }
}
</script>

<style lang="sass" scoped>
header .v-alert
  position: relative
  top: 8px
  width: 300px

.pin
  margin: 20px 30px -20px
  text-align: right

  span
    font-style: italic

  strong
    font-size: 30px
    font-weight: 400
    letter-spacing: 0.5px
    margin-left: 20px
    padding: 4px 10px
    border-radius: 6px

    +theme using ($theme)
      background: map-get($theme, 'cards-selected-bg')

.slots
  padding: 0 30px
  display: grid
  grid-template-columns: 1fr 1fr 1fr
  gap: 30px
  justify-content: center
  margin-top: 40px

.game-setup-overview
  margin-top: 40px
  margin-bottom: 20px

  ::v-deep .rules
    padding-right: 20px
    font-size: 14px

    h2
      margin-right: -20px

h2
  font-weight: 300
  font-size: 16px
  text-transform: uppercase
  text-align: center

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')

.options
  padding: 30px 20px 0

@media (max-width: 1079px)
  .slots
    grid-template-columns: 1fr 1fr

@media (max-width: 919px)
  .slots
    grid-template-columns: 1fr

@media (max-height: 768px)
  .slots
    margin-top: 20px

  .options
    padding-top: 15px
</style>
