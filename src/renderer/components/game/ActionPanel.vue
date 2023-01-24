<template>
  <div
    :class="{ 'action-panel': true, 'full-height': pointsExpression || phase === 'GameOverPhase'}"
    @click.right="onRightClick"
  >
    <div v-if="notifyConnectionClosed" class="flex-grow-1">
      <v-alert type="error">
        Host terminated the game. Connection was closed.
      </v-alert>
    </div>
    <PointsExpression
      v-else-if="pointsExpression"
      :expr="pointsExpression"
    />
    <!-- use v-show bit v-if for pointsExoression - to not hide related layers when pointExpression is triggered by mouse hover  -->
    <component
      :is="actionComponent"
      v-if="action"
      v-show="!pointsExpression && !notifyConnectionClosed"
      :action="action"
      :phase="phase"
      :local="local"
    >
      <template
        v-if="action.canPass"
        #default="{ plain, label }"
      >
        <template v-if="local">
          <span v-if="plain !== ''" class="skip-text text">{{ $t('game.action.or') }}</span>
          <div class="pass-item">
            <v-btn :large="$vuetify.breakpoint.height > 768" color="secondary" @click="pass">{{ label || $t('game.action.skip-action') }}</v-btn>
          </div>
        </template>
        <template v-else>
          <span class="skip-text text">{{ $t('game.action.or') }} {{ $t('game.action.skip-action') }}</span>
        </template>
      </template>
    </component>

    <GameResultPanel
      v-else-if="phase === 'GameOverPhase'"
      v-show="!pointsExpression"
      class="game-over"
    />

    <svg
      v-if="action && activePlayerIndicatorTriangle"
      :class="`active-player-marker ${colorCssClass(action.player)} color-fill`"
      width="42" height="42"
    >
      <polygon points="0,0 42,0 42,42" />
    </svg>

    <audio
      ref="beep"
      :src="BEEP_URL"
    />
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapGetters, mapState } from 'vuex'

import ActionPhaseAction from '@/components/game/actions/ActionPhaseAction.vue'
import BazaarPhaseAction from '@/components/game/actions/BazaarPhaseAction.vue'
import CastlePhaseAction from '@/components/game/actions/CastlePhaseAction.vue'
import CocCountPhaseAction from '@/components/game/actions/CocCountPhaseAction.vue'
import CornCircleChoice from '@/components/game/actions/CornCircleChoice.vue'
import CornCircleReturn from '@/components/game/actions/CornCircleReturn.vue'
import CommitActionPhaseAction from '@/components/game/actions/CommitActionPhaseAction.vue'
import DragonMovePhaseAction from '@/components/game/actions/DragonMovePhaseAction.vue'
import EscapePhaseAction from '@/components/game/actions/EscapePhaseAction.vue'
import FerryPhaseAction from '@/components/game/actions/FerryPhaseAction.vue'
import GameResultPanel from '@/components/game/GameResultPanel.vue'
import GoldPiecePhaseAction from '@/components/game/actions/GoldPiecePhaseAction.vue'
import PointsExpression from '@/components/game/PointsExpression.vue'
import RemoveMageOrWitchAction from '@/components/game/actions/RemoveMageOrWitchAction.vue'
import SelectPrisonerToExchangeAction from '@/components/game/actions/SelectPrisonerToExchangeAction.vue'
import ShepherdPhaseAction from '@/components/game/actions/ShepherdPhaseAction.vue'
import TilePhaseAction from '@/components/game/actions/TilePhaseAction.vue'
import TowerCapturePhaseAction from '@/components/game/actions/TowerCapturePhaseAction.vue'

const MAPPING = {
  AbbeyPhase: TilePhaseAction,
  AbbeyEndGamePhase: TilePhaseAction,
  ChangeFerriesPhase: FerryPhaseAction,
  CocFollowerPhase: ActionPhaseAction,
  CocScoringPhase: ActionPhaseAction,
  CocFinalScoringPhase: ActionPhaseAction,
  PlaceFerryPhase: FerryPhaseAction,
  PhantomPhase: ActionPhaseAction,
  TunnelPhase: ActionPhaseAction,
  WagonPhase: ActionPhaseAction
}

export default {
  components: {
    ActionPhaseAction,
    BazaarPhaseAction,
    CastlePhaseAction,
    CocCountPhaseAction,
    CornCircleChoice,
    CornCircleReturn,
    CommitActionPhaseAction,
    DragonMovePhaseAction,
    EscapePhaseAction,
    GameResultPanel,
    GoldPiecePhaseAction,
    FerryPhaseAction,
    PointsExpression,
    RemoveMageOrWitchAction,
    SelectPrisonerToExchangeAction,
    ShepherdPhaseAction,
    TilePhaseAction,
    TowerCapturePhaseAction
  },

  props: {
    phase: { type: String, required: true },
    action: { type: Object, default: null }
  },

  data () {
    const src = require('~/assets/beep.wav')
    return {
      selected: 0,
      BEEP_URL: src?.default ? src.default : src // hack, Nuxt doesn't convert asset to string directly (at least in dev mode)
    }
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass',
      local: 'game/isActionLocal'
    }),

    ...mapState({
      connectionState: state => state.networking.connectionStatus,
      pointsExpression: state => state.board.pointsExpression,
      beep: state => state.settings.beep,
      activePlayerIndicatorTriangle: state => state.settings.activePlayerIndicatorTriangle
    }),

    playerIndex () {
      return this.action?.player
    },

    notifyConnectionClosed () {
      return this.connectionState === null && this.phase !== 'GameOverPhase'
    },

    actionComponent () {
      const itemType = this.action.items.length ? this.action.items[0].type : null
      if (itemType === 'Confirm') {
        return CommitActionPhaseAction
      }

      const component = MAPPING[this.phase]
      if (component) {
        return component
      }

      if (this.phase === 'CornCirclePhase') {
        if (itemType === 'CornCircleSelectDeployOrRemove') {
          return CornCircleChoice
        } else {
          return itemType === 'ReturnMeeple' ? CornCircleReturn : ActionPhaseAction
        }
      }
      if (this.phase === 'TowerCapturePhase' && itemType === 'SelectPrisonerToExchange') {
        return SelectPrisonerToExchangeAction
      }
        console.log(itemType);
      if (this.phase === 'MageAndWitchPhase') {
        if (itemType === 'RemoveMageOrWitch') {
          return RemoveMageOrWitchAction
        } else {
          return ActionPhaseAction
        }
      }
      return this.phase + 'Action'
    }
  },

  watch: {
    local (val) {
      if (val) {
        this.onPlayerActivated()
      } else {
        this.onPlayerDeactivated()
      }
    }
  },

  mounted () {
    window.addEventListener('keydown', this.onKeyDown)
    if (this.local) {
      this.onPlayerActivated()
    }

    this._restored = () => {
      this.clearProgress()
    }
    this._minimized = () => {
      if (this.local) {
        this.setupProgress()
      }
    }

    ipcRenderer.on('win.restore', this._restored)
    ipcRenderer.on('win.show', this._restored)
    ipcRenderer.on('win.focus', this._restored)
    ipcRenderer.on('win.minimize', this._minimized)
    ipcRenderer.on('win.hide', this._minimized)
    ipcRenderer.on('win.blur', this._minimized)
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
    ipcRenderer.off('win.restore', this._restored)
    ipcRenderer.off('win.show', this._restored)
    ipcRenderer.off('win.focus', this._restored)
    ipcRenderer.off('win.minimize', this._minimized)
    ipcRenderer.off('win.hide', this._minimized)
    ipcRenderer.off('win.blur', this._minimized)
  },

  methods: {
    onRightClick (ev) {
      this.$root.$emit('rclick', ev)
    },

    onKeyDown (ev) {
      if (ev.key === ' ' && this.action?.canPass && !this.$store.state.gameDialog) {
        this.pass()
      }
    },

    async pass () {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'PASS',
          payload: {}
        })
      }
    },

    async onPlayerActivated () {
      this.$store.commit('board/pointsExpression', null)
      if (this.beep) {
        this.$refs.beep.play()
      }
      const visible = await ipcRenderer.invoke('win.isVisible')
      if (!visible) {
        this.setupProgress()
      }
    },

    onPlayerDeactivated () {
      this.clearProgress()
    },

    setupProgress () {
      ipcRenderer.invoke('win.setProgressBar', [1, {
        mode: 'indeterminate'
      }])
    },

    clearProgress () {
      ipcRenderer.invoke('win.setProgressBar', [-1])
    }
  }
}
</script>

<style lang="sass">
.action-panel
  position: absolute
  top: 0
  left: 0px
  width: calc(100% - var(--aside-width-plus-gap))
  height: var(--action-bar-height)
  display: flex
  align-items: stretch
  user-select: none

  &.full-height
    height: 84px

  +theme using ($theme)
    background: map-get($theme, 'opaque-bg')

  .text
    font-size: 20px
    font-weight: 300

  > section
    flex: 1
    display: flex
    justify-content: center
    align-items: center

    .skip-text
      margin-left: 40px

    .pass-item
      margin-left: 40px
      text-align: center

  .tile-img
    position: relative
    width: 84px
    height: 84px
    box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.35)
    top: 7px
    transform: scale(1.1)

.active-player-marker
  position: absolute
  top: 0
  right: 0

@media (max-width: 1080px)
  .action-panel > section
    .skip-text
      margin-left: 20px

    .pass-item
      margin-left: 20px

@media (max-height: 768px)
  .action-panel
    .text
      font-size: 18px

    .tile-img
      width: 72px
      height: 72px
      transform: none
</style>
