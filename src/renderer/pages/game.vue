<template>
  <div class="view game-view">
    <template v-if="phase">
      <div v-if="forcedDraw" class="forced-draw">
        Game was created in development mode.<br>
        Tile draw order is predefined.
      </div>
      <TestResult v-if="testScenarioResult" :result="testScenarioResult" />
      <Board />
      <TilePackSize :size="tilePackSize" @click.native="tilePackOpen = !tilePackOpen" />
      <aside ref="aside" :class="`shrink-${shrink}`">
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

    <v-dialog
      v-model="tilePackOpen"
      max-width="800"
    >
      <TilePackDialog @close="tilePackOpen = false" />
    </v-dialog>
  </div>
</template>

<script>
import path from 'path'
import { mapState } from 'vuex'
import { remote } from 'electron'

import ActionPanel from '@/components/game/ActionPanel.vue'
import Board from '@/components/game/Board.vue'
import FinalScoringEvents from '@/components/game/FinalScoringEvents.vue'
import ChooseMonkOrAbbotDialog from '@/components/game/dialogs/ChooseMonkOrAbbotDialog.vue'
import TilePackDialog from '@/components/game/dialogs/TilePackDialog.vue'
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
    TilePackDialog,
    TilePackSize
  },

  data () {
    return {
      shrink: 0
    }
  },

  computed: {
    ...mapState({
      action: state => state.game.action,
      activePlayerIdx: state => state.game.action?.player,
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

    tilePackOpen: {
      get () {
        return this.$store.state.showGameTiles
      },

      set (value) {
        this.$store.commit('showGameTiles', value)
      }
    }
  },

  watch: {
    phase (newVal, oldVal) {
      if (!oldVal) {
        this.checkOverflow()
      }
    },

    activePlayerIdx (val) {
      this.setPlayerIcon(val)
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
    this.shrinkChanged = false
    window.addEventListener('resize', this.onRezize)
    this.checkOverflow()
    this.setPlayerIcon(this.activePlayerIdx)
    this.gameId = this.$store.state.game.id
  },

  beforeDestroy () {
    this._ro?.disconnect()
    window.removeEventListener('resize', this.onRezize)
    clearTimeout(this.checkOverflowTimeout)
    this.setPlayerIcon(null)
    if (this.gameId === this.$store.state.game.id) {
      // close only if not already closed (eg by Play Again button )
      this.$store.dispatch('game/close')
    }
    this.$store.commit('showGameTiles', false)
  },

  methods: {
    setPlayerIcon (idx) {
      let icon
      if (Number.isInteger(idx)) {
        const slot = this.$store.state.game.players[idx].slot
        icon = `p${slot}.png`
      } else {
        icon = 'default.png'
      }

      try {
        const { BrowserWindow, app } = remote
        const w = BrowserWindow.getAllWindows()[0]
        if (process.env.NODE_ENV === 'development') {
          w.setIcon(path.join('icons', icon))
        } else {
          const basePath = path.dirname(app.getAppPath())
          w.setIcon(path.join(basePath, 'icons', icon))
        }
      } catch (e) {
        console.error(e)
      }
    },

    onRezize () {
      clearTimeout(this.checkOverflowTimeout)
      this.checkOverflowTimeout = setTimeout(this.checkOverflow, 20)
    },

    checkOverflow () {
      const { aside } = this.$refs
      if (!aside) {
        return
      }

      if (!this._ro) {
        this._ro = new ResizeObserver(ev => {
          if (this.shrinkChanged) {
            // triggered from checkOverflow
            this.shrinkChanged = false
          } else {
            // triggered by changed content
            this.shrinkSizes = [null, null, null]
            this.checkOverflow()
          }
        })
        this._ro.observe(aside)
      }

      const availableHeight = this.$el.clientHeight - aside.getBoundingClientRect().top
      const height = aside.clientHeight
      const sizes = this.shrinkSizes

      if (sizes[this.shrink] === null) {
        sizes[this.shrink] = height
      }

      if (availableHeight < height && this.shrink < 2) {
        this.shrink += 1
        this.shrinkChanged = true
        setTimeout(this.checkOverflow, 1)
      }
      if (availableHeight > height && this.shrink > 0) {
        const target = this.shrink - 1
        if (sizes[target] === null || sizes[target] <= availableHeight) {
          this.shrink = target
          this.shrinkChanged = true
          setTimeout(this.checkOverflow, 1)
        }
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
  cursor: pointer

  +theme using ($theme)
    background: map-get($theme, 'opaque-bg')

aside
  position: absolute
  top: #{$action-bar-height + $panel-gap}
  right: 0
  width: var(--aside-width)
  // max-height: calc(100vh - #{$action-bar-height + $panel-gap})
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
