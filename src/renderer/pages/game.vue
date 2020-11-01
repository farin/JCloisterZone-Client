<template>
  <div class="view game-view">
    <template v-if="phase">
      <div v-if="forcedDraw" class="forced-draw">
        Game is created in development mode.<br>
        Tile draw order is predefined.
      </div>
      <TestResult v-if="testScenarioResult" :result="testScenarioResult" />
      <Board />
      <TilePackSize :size="tilePackSize" />
      <aside ref="aside">
        <PlayerPanel
          v-for="(player, idx) in players"
          ref="pp"
          :key="idx"
          :index="idx"
          :player="player"
          :style="{zIndex: 1000 + idx}"
          :shrink="shrink"
        />
      </aside>
      <ActionPanel
        :phase="phase"
        :action="action"
      />
      <PlayEvents />
      <FinalScoringEvents v-if="phase === 'GameOverPhase'" />
      <div
        v-if="gameDialog"
        class="game-modal"
      >
        <div class="game-modal-content">
          <ChooseMonkOrAbbotDialog
            v-if="gameDialog.type === 'monk-or-abbot'"
            v-bind="gameDialog.attrs"
          />
        </div>
      </div>
    </template>
    <template v-else>
      <v-row justify="center" align="center">
        <v-progress-circular indeterminate />
      </v-row>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import ActionPanel from '@/components/game/ActionPanel.vue'
import Board from '@/components/game/Board.vue'
import FinalScoringEvents from '@/components/game/FinalScoringEvents.vue'
import ChooseMonkOrAbbotDialog from '@/components/game/dialogs/ChooseMonkOrAbbotDialog.vue'
import PlayerPanel from '@/components/game/PlayerPanel.vue'
import PlayEvents from '@/components/game/PlayEvents.vue'
import TestResult from '@/components/game/TestResult.vue'
import TilePackSize from '@/components/game/TilePackSize.vue'

export default {
  components: {
    ActionPanel,
    Board,
    FinalScoringEvents,
    ChooseMonkOrAbbotDialog,
    PlayerPanel,
    PlayEvents,
    TestResult,
    TilePackSize
  },

  data () {
    return {
      shrink: 0
    }
  },

  computed: mapState({
    action: state => state.game.action,
    gameDialog: state => state.gameDialog,
    phase: state => state.game.phase,
    players: state => state.game.players,
    tilePackSize: state => state.game.tilePack.size,
    testScenarioResult: state => state.game.testScenarioResult,
    forcedDraw: state => {
      if (process.env.NODE_ENV === 'development') {
        return false
      }
      const { drawOrder, endTurn } = state.game.gameAnnotations
      return !!(drawOrder || endTurn)
    },
    gameHash: state => state.game.hash
  }),

  watch: {
    gameHash () {
      // this.shrinkSizes = [null, null, null]
      // this.checkOverflow()
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
    this.shrinkSizes = [null, null, null]
    window.addEventListener('resize', this.onRezize)
    this.recordShrinkSize()
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.onRezize)
    clearTimeout(this.checkOverflow)
    this.$store.dispatch('game/close')
  },

  methods: {
    onRezize () {
      clearTimeout(this.checkOverflowTimeout)
      this.checkOverflowTimeout = setTimeout(this.checkOverflow, 200)
    },

    recordShrinkSize () {
      if (this.shrinkSizes[this.shrink] === null) {
        this.shrinkSizes[this.shrink] = this.$refs.aside.clientHeight
      }
    },

    shrinkTo (val) {
      const availableHeight = this.$el.clientHeight - this.$refs.aside.getBoundingClientRect().top
      // don't grow if there is not enough space
      console.log(`${this.shrink} -> ${val}`, this.shrinkSizes, this.shrinkSizes[val], availableHeight, this.shrinkSizes[val] !== null && val > this.shrinkTo && availableHeight < this.shrinkSizes[val])
      if (this.shrinkSizes[val] !== null && val > this.shrinkTo && availableHeight < this.shrinkSizes[val]) {
        return
      }
      this.shrink = val
      setTimeout(() => {
        this.recordShrinkSize()
        // if (this.shrink === 1) { // midpoint check if another is required
        //   this.checkOverflow()
        // }
      }, 1)
    },

    checkOverflow () {
      const overflow = this.$refs.pp.reduce((acc, pp) => Math.max(pp.calculateOverflow(), acc), 0)
      console.log(overflow)
      if (overflow) {
        if (this.shrink < 2) {
          this.shrinkTo(this.shrink + 1)
        }
      } else if (this.shrink > 0) {
        this.shrinkTo(this.shrink - 1)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.game-view
  position: relative
  display: flex
  overflow: hidden
  height: 100vh

  .forced-draw, .test-result
    position: absolute
    top: #{$action-bar-height + $panel-gap}
    right: var(--aside-width-plus-gap)

  .forced-draw
    padding: 5px
    background-color: #AD1457
    color: white
    font-weight: 600

.board
  flex: 1
  +theme using ($theme)
    background: map-get($theme, 'board-bg')

.tile-pack-size
  position: absolute
  top: 0
  right: 0
  width: var(--aside-width)
  height: $action-bar-height

  +theme using ($theme)
    background: map-get($theme, 'opaque-bg')

aside
  position: absolute
  top: #{$action-bar-height + $panel-gap}
  right: 0
  width: var(--aside-width)
  max-height: calc(100vh - #{$action-bar-height + $panel-gap})
  user-select: none
  display: flex
  flex-direction: column

.game-modal
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100vh
  background: rgba(255, 255, 255, 0.8)
  z-index: 99
  display: flex
  align-items: center
  justify-content: center

  .game-modal-content
    position: relative
    box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.45)
    padding: 40px 60px

    +theme using ($theme)
      color: map-get($theme, 'cards-text')
      background: map-get($theme, 'cards-bg')
</style>
