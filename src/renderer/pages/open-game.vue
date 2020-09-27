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

    this.$connection.on('close', this._onGameClose = () => {
      // TODO print message
      this.$router.push('/')
    })
  },

  beforeDestroy () {
    this._onGameClose && this.$connection.off('close', this._onGameClose)
  },

  methods: {
    showTilePack () {
      this.$store.commit('gameSetup/detail', { view: 'tile-pack' })
    },

    async startGame () {
      const players = this.slots.filter(s => s.sessionId).map(s => ({ ...s }))
      players.sort((a, b) => a.order - b.order)
      players.forEach(s => {
        s.slot = s.number
        delete s.number
        delete s.order
      })
      this.$store.commit('game/players', players)
      await this.$store.dispatch('game/start')
      this.$router.push('/game')
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
