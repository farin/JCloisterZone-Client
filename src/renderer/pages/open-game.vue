<template>
  <GameSetupGrid v-if="$store.state.tilesLoaded">
    <template #header>
      <v-alert v-if="javaMissing" type="warning">
        No Java
      </v-alert>
      <v-alert v-else-if="javaOutdated" type="warning">
        Outdated Java
      </v-alert>
      <v-alert v-else-if="!engineReady" type="warning">
        Engine.jar unavailable
      </v-alert>
      <v-alert v-else-if="!slotsAssigned" type="info">
        No players added
      </v-alert>


      <v-btn large color="primary" :disabled="!engineReady || !slotsAssigned" @click="startGame">
        <v-icon left>fas fa-play</v-icon>
        Start
      </v-btn>

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
          :state="slot.state"
          :name="slot.name"
          :order="slot.order"
        />
      </div>
    </template>

    <template #detail>
      <GameSetupOverview />
    </template>
  </GameSetupGrid>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import GameSetupOverview from '@/components/game-setup/GameSetupOverview'
import GameSetupGrid from '@/components/game-setup/GameSetupGrid'
import PlayerSlot from '@/components/game-setup/PlayerSlot'
import TilePackSize from '@/components/game/TilePackSize'

export default {
  components: {
    GameSetupOverview,
    GameSetupGrid,
    PlayerSlot,
    TilePackSize
  },

  computed: {
    ...mapState({
      sets: state => state.gameSetup.sets,
      slots: state => state.gameSetup.slots
    }),

    ...mapGetters({
      javaMissing: 'javaMissing',
      javaOutdated: 'javaOutdated',
      engineReady: 'engineReady'
    }),

    slotsAssigned () {
      return !!this.slots.find(({ state }) => state !== 'open')
    }
  },

  beforeCreate () {
    if (!this.$store.state.game.setup) {
      this.$store.dispatch('game/close')
      this.$router.push('/')
    }
  },

  methods: {
    showTilePack () {
      this.$store.commit('gameSetup/detail', { view: 'tile-pack' })
    },

    async startGame () {
      const players = this.slots.filter(s => s.state !== 'open').map(s => ({ ...s }))
      players.sort((a, b) => a.order - b.order)
      players.forEach(s => {
        s.slot = s.number
        delete s.number
        delete s.order
      })
      this.$store.commit('game/players', players)
      await this.$store.dispatch('game/start')
      this.$store.commit('board/resetZoom')
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
  margin: 40px

</style>
