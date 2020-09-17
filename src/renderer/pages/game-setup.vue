<template>
  <GameSetupGrid v-if="loaded">
    <template #header>
      <v-tabs v-model="tab">
        <v-tab>Tiles</v-tab>
        <v-tab>Components</v-tab>
        <v-tab>Rules</v-tab>
        <v-tab>Timer</v-tab>
      </v-tabs>

      <HeaderGameButton title="Create" @click="createGame" />

      <TilePackSize :size="$tiles.getPackSize(sets, rules)" />
    </template>

    <template #detail-header>
      <template>
        <h2 class="tile-pack-header">Selected tiles</h2>
      </template>
    </template>

    <template #main>
      <TileSetsTab v-show="tab === 0" />
      <FiguresTab v-show="tab === 1" />
      <RulesTab v-show="tab === 2" />
      <TimerTab v-show="tab === 3" />
    </template>

    <template #detail>
      <div class="detail-pack">
        <TileDistribution :sets="sets" :rules="rules" @tile-click="onTileClick" />
        <GameAnnotationsPanel v-if="settings.devMode" ref="annotationsPanel" />
      </div>
    </template>
  </GameSetupGrid>
</template>

<script>
import { mapGetters, mapState } from 'vuex'


import ExpansionSymbol from '@/components/ExpansionSymbol'
import FiguresTab from '@/components/game-setup/tabs/FiguresTab'
import GameAnnotationsPanel from '@/components/dev/GameAnnotationsPanel'
import GameSetupGrid from '@/components/game-setup/GameSetupGrid'
import HeaderGameButton from '@/components/game-setup/HeaderGameButton'
import TileDistribution from '@/components/TileDistribution'
import TilePackSize from '@/components/game/TilePackSize'
import TileSetsTab from '@/components/game-setup/tabs/TileSetsTab'
import TimerTab from '@/components/game-setup/tabs/TimerTab'
import RulesTab from '@/components/game-setup/tabs/RulesTab'

export default {
  components: {
    ExpansionSymbol,
    FiguresTab,
    GameSetupGrid,
    GameAnnotationsPanel,
    HeaderGameButton,
    TileDistribution,
    TilePackSize,
    TileSetsTab,
    TimerTab,
    RulesTab
  },

  data () {
    return {
      tab: 0
    }
  },

  computed: {
    ...mapState({
      sets: state => state.gameSetup.sets,
      rules: state => state.gameSetup.rules,
      detail: state => state.gameSetup.detail,
      settings: state => state.settings,
    }),

    ...mapGetters({
      loaded: 'loaded',
      javaMissing: 'javaMissing',
      javaOutdated: 'javaOutdated',
      engineReady: 'engineReady',
      containsCoreSet: 'gameSetup/containsCoreSet'
    })
  },

  methods: {
    async createGame () {
      await this.$store.dispatch('gameSetup/createGame')
      this.$router.push('/open-game')
    },

    onTileClick (tileId) {
      if (this.settings.devMode) {
        this.$refs.annotationsPanel.appendTile(tileId)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.detail-pack
  padding: 20px

header
  .warning-text, .info-text
    font-size: 24px
    white-space: nowrap
    background-color: #F44336
    color: white
    padding: 0 20px
    border-radius: 4px

.tile-pack-size
  cursor: pointer

.dev-panel
  border-top: 1px solid black
  margin-top: 20px
  opacity: 0.1
  min-height: 200px

  &.visible
    opacity: 1

  h5
    margin-top: 10px
    text-align: center
</style>
