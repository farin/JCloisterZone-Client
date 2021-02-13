<template>
  <GameSetupGrid v-if="loaded && gameId" :sets="sets" :rules="rules">
    <template #header>
      <template v-if="isOwner">
        <HeaderGameButton
          title="Start"
          :info="slotsAssigned ? null : (readOnly ? 'Assign all players to start' : 'No player in game')"
          @click="startGame"
        />
      </template>
      <template v-else>
        <span class="text">Waiting for host to start the game.</span>
      </template>
    </template>

    <template #main>
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

      <GameSetupOverview :sets="sets" :elements="elements" :timer="timer" />
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
      gameId: state => state.game.id,
      sets: state => state.game.setup?.sets,
      rules: state => state.game.setup?.rules,
      elements: state => state.game.setup?.elements,
      timer: state => state.game.setup?.timer,
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
    async startGame () {
      await this.$store.dispatch('game/start')
    }
  }
}
</script>

<style lang="sass" scoped>
header .v-alert
  position: relative
  top: 8px
  width: 300px

.slots
  padding: 0 30px
  display: grid
  grid-template-columns: 1fr 1fr 1fr
  gap: 30px
  justify-content: center
  margin-top: 40px

.game-setup-overview
  margin: 40px 0

.options
  padding: 30px 20px 0

  h2
    font-weight: 300
    font-size: 16px
    text-transform: uppercase
    text-align: center

    +theme using ($theme)
      color: map-get($theme, 'gray-text-color')

@media (max-width: 1079px)
  .slots
    grid-template-columns: 1fr 1fr

@media (max-width: 919px)
  .slots
    grid-template-columns: 1fr

</style>
