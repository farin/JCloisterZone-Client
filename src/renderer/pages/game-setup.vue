<template>
  <GameSetupGrid v-if="loaded">
    <template #header>
      <v-tabs v-model="tab">
        <v-tab>Tiles</v-tab>
        <v-tab>Components</v-tab>
        <v-tab>Rules</v-tab>
        <v-tab>Timer</v-tab>
      </v-tabs>

      <v-alert v-if="javaMissing" type="warning">
        No Java
      </v-alert>
      <v-alert v-else-if="javaOutdated" type="warning">
        Outdated Java
      </v-alert>
      <v-alert v-else-if="!engineReady" type="warning">
        Engine.jar unavailable
      </v-alert>
      <v-alert v-else-if="!containsCoreSet" type="info">
        No core set
      </v-alert>

      <v-btn large color="primary" :disabled="!engineReady || !containsCoreSet" @click="createGame">
        <v-icon left>fas fa-play</v-icon>
        Create
      </v-btn>

      <TilePackSize :size="$tiles.getPackSize(sets, rules)" @click.native="showTilePack" />
    </template>

    <template #detail-header>
      <template v-if="detail.view === 'tile-pack'">
        <h2 class="tile-pack-header">Selected tiles</h2>
      </template>
      <template v-if="detail.view === 'expansion'">
        <ExpansionSymbol :expansion="detail.expansion" :size="32" />
        <h2>{{ detail.expansion.title }}</h2>
      </template>
    </template>

    <template #main>
      <TileSetsTab v-show="tab === 0" />
      <FiguresTab v-show="tab === 1" />
      <RulesTab v-show="tab === 2" />
      <TimerTab v-show="tab === 3" />
    </template>

    <template #detail>
      <div v-if="detail.view === 'tile-pack'" class="detail-pack">
        <TileDistribution :sets="sets" :rules="rules" @tile-click="onTileClick" />
        <GameAnnotationsPanel v-if="isDev" ref="annotationsPanel" />
      </div>
      <div v-if="detail.view === 'expansion'">
        <ExpansionDetail :expansion="detail.expansion" />
      </div>
    </template>
  </GameSetupGrid>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import ExpansionDetail from '@/components/game-setup/ExpansionDetail'
import ExpansionSymbol from '@/components/ExpansionSymbol'
import FiguresTab from '@/components/game-setup/tabs/FiguresTab'
import GameAnnotationsPanel from '@/components/dev/GameAnnotationsPanel'
import GameSetupGrid from '@/components/game-setup/GameSetupGrid'
import TileDistribution from '@/components/TileDistribution'
import TilePackSize from '@/components/game/TilePackSize'
import TileSetsTab from '@/components/game-setup/tabs/TileSetsTab'
import TimerTab from '@/components/game-setup/tabs/TimerTab'
import RulesTab from '@/components/game-setup/tabs/RulesTab'

export default {
  components: {
    ExpansionDetail,
    ExpansionSymbol,
    FiguresTab,
    GameSetupGrid,
    GameAnnotationsPanel,
    TileDistribution,
    TilePackSize,
    TileSetsTab,
    TimerTab,
    RulesTab
  },

  data () {
    return {
      tab: 0,
      isDev: process.env.NODE_ENV === 'development'
    }
  },

  computed: {
    ...mapState({
      sets: state => state.gameSetup.sets,
      rules: state => state.gameSetup.rules,
      detail: state => state.gameSetup.detail,
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
    showTilePack () {
      this.$store.commit('gameSetup/detail', { view: 'tile-pack' })
    },

    async createGame () {
      await this.$store.dispatch('gameSetup/createGame')
      this.$router.push('/open-game')
    },

    onTileClick (tileId) {
      if (this.isDev) {
        this.$refs.annotationsPanel.appendTile(tileId)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.detail-pack
  padding: 20px

header .v-alert
  position: relative
  top: 8px
  width: 300px

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
