<template>
  <div class="view game-view">
    <template v-if="phase">
      <div v-if="forcedDraw" class="forced-draw">
        Game is created in development mode.<br>
        Tile draw order is predefined.
      </div>
      <TestResult v-if="testScenarioResult" :result="testScenarioResult" />
      <Board />
      <aside>
        <TilePackSize :size="tilePackSize" />
        <PlayerPanel
          v-for="(player, idx) in players"
          :key="idx"
          :index="idx"
          :player="player"
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
    }
  }),

  beforeCreate () {
    // useful for dev mode, reload on this page redirects back to home
    if (!this.$connection.isConnectedOrConnecting()) {
      this.$store.dispatch('game/close')
      this.$router.push('/')
    }
  },

  mounted () {
    this.$connection.on('close', this._onClose = () => {
      // TODO print message instea
      this.$router.push('/')
    })
  },

  beforeDestroy () {
    this._onClose && this.$connection.off('close', this._onClose)
    this.$store.dispatch('game/close')
  }
}
</script>

<style lang="sass" scoped>
.game-view
  position: relative
  display: flex
  overflow: hidden
  height: 100vh

  .forced-draw
    position: absolute
    top: #{$action-bar-height + $panel-gap}
    right: #{$rside-width + $panel-gap}
    padding: 5px
    background-color: #AD1457
    color: white
    font-weight: 600

  .test-result
    position: absolute
    top: #{$action-bar-height + $panel-gap}
    right: #{$rside-width + $panel-gap}

.board
  flex: 1
  background: $bg-color

aside
  box-sizing: border-box
  width: $rside-width
  heigh: 100vh
  position: absolute
  top: 0
  right: 0
  user-select: none


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
    background: white
    box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.45)
    padding: 40px 60px
</style>
