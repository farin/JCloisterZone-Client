<template>
  <GameSetupGrid v-if="loaded" :sets="sets" :rules="rules">
    <template #header>
      <v-tabs v-model="tab" @change="onTabChange">
        <v-tab><v-icon small>far fa-heart</v-icon></v-tab>
        <v-tab>Tiles</v-tab>
        <v-tab>Components</v-tab>
        <v-tab>Rules</v-tab>
        <v-tab>Timer</v-tab>
      </v-tabs>

      <HeaderGameButton title="Create" :sets="sets" @click="createGame" />
    </template>

    <template #main>
      <BookmarksTab v-show="tab === 0" @load="tab = 1" />
      <TileSetsTab v-show="tab === 1" />
      <FiguresTab v-show="tab === 2" />
      <RulesTab v-show="tab === 3" />
      <TimerTab v-show="tab === 4" />
    </template>

    <template #detail>
      <div v-if="tab > 0" class="detail-pack">
        <h2>Selected tiles</h2>
        <TileDistribution
          :tile-size="$vuetify.breakpoint.height > 768 ? 100 : 80"
          :sets="sets"
          :rules="rules"
          @tile-click="onTileClick"
        />
        <GameAnnotationsPanel v-if="settings.devMode && $store.state.networking.connectionType !== 'online'" ref="annotationsPanel" />
      </div>
    </template>
  </GameSetupGrid>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import BookmarksTab from '@/components/game-setup/tabs/BookmarksTab'
import FiguresTab from '@/components/game-setup/tabs/FiguresTab'
import GameAnnotationsPanel from '@/components/dev/GameAnnotationsPanel'
import GameSetupGrid from '@/components/game-setup/GameSetupGrid'
import HeaderGameButton from '@/components/game-setup/HeaderGameButton'
import TileDistribution from '@/components/TileDistribution'
import TileSetsTab from '@/components/game-setup/tabs/TileSetsTab'
import TimerTab from '@/components/game-setup/tabs/TimerTab'
import RulesTab from '@/components/game-setup/tabs/RulesTab'

export default {
  components: {
    BookmarksTab,
    FiguresTab,
    GameSetupGrid,
    GameAnnotationsPanel,
    HeaderGameButton,
    TileDistribution,
    TileSetsTab,
    TimerTab,
    RulesTab
  },

  data () {
    return {
      tab: 1
    }
  },

  computed: {
    ...mapState({
      sets: state => state.gameSetup.sets,
      rules: state => state.gameSetup.rules,
      detail: state => state.gameSetup.detail,
      settings: state => state.settings
    }),

    ...mapGetters({
      loaded: 'loaded'
    })
  },

  methods: {
    async createGame () {
      await this.$store.dispatch('gameSetup/createGame')
    },

    onTileClick (tileId) {
      if (this.settings.devMode && this.$store.state.networking.connectionType !== 'online') {
        this.$refs.annotationsPanel.appendTile(tileId)
      }
    },

    onTabChange () {
      window.scrollTo(0, 0)
    }
  }
}
</script>

<style lang="sass" scoped>
.detail-pack
  padding: 20px

  h2
    text-align: center
    margin-bottom: $panel-gap

    font-weight: 300
    font-size: 16px
    text-transform: uppercase

    +theme using ($theme)
      color: map-get($theme, 'gray-text-color')

header
  .warning-text, .info-text
    font-size: 24px
    white-space: nowrap
    background-color: #F44336
    color: white
    padding: 0 20px
    border-radius: 4px

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

@media (max-height: 768px)
  .detail-pack
    padding: 10px

</style>
