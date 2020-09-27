<template>
  <GameSetupGrid v-if="loaded && gameId">
    <template #header>
      <template v-if="isOwner">
        <HeaderGameButton
          title="Start"
          :info="slotsAssigned ? null : 'No players added'"
          @click="startGame"
        />
      </template>
      <template v-else>

      </template>
      <TilePackSize :size="$tiles.getPackSize(sets)" />
    </template>

    <template #detail-header>
      <h2>Game Setup</h2>
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
        />
      </div>
    </template>

    <template #detail>
      <GameSetupOverview :sets="sets" :elements="elements" />
    </template>
  </GameSetupGrid>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import GameSetupOverview from '@/components/game-setup/overview/GameSetupOverview'
import GameSetupGrid from '@/components/game-setup/GameSetupGrid'
import HeaderGameButton from '@/components/game-setup/HeaderGameButton'
import PlayerSlot from '@/components/game-setup/PlayerSlot'
import TilePackSize from '@/components/game/TilePackSize'

export default {
  components: {
    GameSetupOverview,
    GameSetupGrid,
    HeaderGameButton,
    PlayerSlot,
    TilePackSize
  },

  computed: {
    ...mapState({
      gameId: state => state.game.id,
      sets: state => state.game.setup?.sets,
      elements: state => state.game.setup?.elements,
      slots: state => state.gameSetup.slots,
      isOwner: state => state.game.owner === state.settings.clientId
    }),

    ...mapGetters({
      loaded: 'loaded',
      javaMissing: 'javaMissing',
      javaOutdated: 'javaOutdated',
      engineReady: 'engineReady'
    }),

    slotsAssigned () {
      return !!this.slots.find(slot => slot.sessionId)
    }
  },

  beforeCreate () {
    // useful for dev mode, reload on this page redirects back to home
    if (!this.$connection.isConnectedOrConnecting()) {
      this.$store.dispatch('game/close')
      this.$router.push('/')
      return
    }
  },

  mouted () {
    this.$connection.on('close', this._onClose = () => {
      // TODO print message
      this.$router.push('/')
    })
    this.$connection.on('message', this._onMessage = ({ type }) => {
      if (type === 'START') {
        this.$router.push('/game')
      }
    })
  },

  beforeDestroy () {
    this._onClose && this.$connection.off('close', this._onClose)
    this._onMessage && this.$connection.off('message', this._onMessage)
  },

  methods: {
    showTilePack () {
      this.$store.commit('gameSetup/detail', { view: 'tile-pack' })
    },

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


@media (max-width: 1079px)
  .slots
    grid-template-columns: 1fr 1fr


@media (max-width: 919px)
  .slots
    grid-template-columns: 1fr

</style>
