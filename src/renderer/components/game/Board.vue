<template>
  <svg
    ref="svg"
    class="board" draggable
    @wheel.passive="onWheel"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @click.right="onRightClick"
  >
    <g :transform="transform">
      <TilePlacementLayer
        v-if="layers.TilePlacementLayer"
        v-bind="layers.TilePlacementLayer"
      />
      <TileLayer />
      <TowerLayer v-if="elements.tower" />
      <CastleLayer v-if="elements.castle" />
      <TokenLayer />
      <FlierLayer />
      <MeepleLayer />
      <BridgeLayer v-if="elements.bridge" />
      <MeepleLayer deployed-on-bridge />
      <ScoreLayer />
      <FeatureSelectLayer
        v-if="layers.FeatureSelectLayer"
        v-bind="layers.FeatureSelectLayer"
      />
      <FerryChangeLayer
        v-if="layers.FerryChangeLayer"
        v-bind="layers.FerryChangeLayer"
      />
      <TunnelSelectLayer
        v-if="layers.TunnelSelectLayer"
        v-bind="layers.TunnelSelectLayer"
      />
      <CastleBaseSelectLayer
        v-if="layers.CastleBaseSelectLayer"
        v-bind="layers.CastleBaseSelectLayer"
      />
      <TileSelectLayer
        v-if="layers.TileSelectLayer"
        v-bind="layers.TileSelectLayer"
      />
      <TowerSelectLayer
        v-if="layers.TowerSelectLayer"
        v-bind="layers.TowerSelectLayer"
      />
      <BridgeSelectLayer
        v-if="layers.BridgeSelectLayer"
        v-bind="layers.BridgeSelectLayer"
      />
      <DragonMoveLayer
        v-if="layers.DragonMoveLayer"
        v-bind="layers.DragonMoveLayer"
      />
    </g>
    <EmphasizeLayer
      v-if="layers.EmphasizeLayer"
      v-bind="layers.EmphasizeLayer"
      :global-transform="transform"
    />
  </svg>
</template>

<script>
import Vue from 'vue'
import { mapGetters, mapState } from 'vuex'

import BridgeLayer from '@/components/game/layers/BridgeLayer'
import BridgeSelectLayer from '@/components/game/layers/BridgeSelectLayer'
import CastleLayer from '@/components/game/layers/CastleLayer'
import CastleBaseSelectLayer from '@/components/game/layers/CastleBaseSelectLayer'
import DragonMoveLayer from '@/components/game/layers/DragonMoveLayer'
import EmphasizeLayer from '@/components/game/layers/EmphasizeLayer'
import FerryChangeLayer from '@/components/game/layers/FerryChangeLayer'
import FlierLayer from '@/components/game/layers/FlierLayer'
import TokenLayer from '@/components/game/layers/TokenLayer'
import TowerLayer from '@/components/game/layers/TowerLayer'
import FeatureSelectLayer from '@/components/game/layers/FeatureSelectLayer'
import MeepleLayer from '@/components/game/layers/MeepleLayer'
import ScoreLayer from '@/components/game/layers/ScoreLayer'
import TileLayer from '@/components/game/layers/TileLayer'
import TilePlacementLayer from '@/components/game/layers/TilePlacementLayer'
import TileSelectLayer from '@/components/game/layers/TileSelectLayer'
import TowerSelectLayer from '@/components/game/layers/TowerSelectLayer'
import TunnelSelectLayer from '@/components/game/layers/TunnelSelectLayer'

const ACTION_PANEL_HEIGHT = 160
const KEY_PRESSED_OFFSET = 30

export default {
  components: {
    BridgeLayer,
    BridgeSelectLayer,
    CastleLayer,
    CastleBaseSelectLayer,
    DragonMoveLayer,
    EmphasizeLayer,
    FeatureSelectLayer,
    FerryChangeLayer,
    FlierLayer,
    MeepleLayer,
    ScoreLayer,
    TileLayer,
    TilePlacementLayer,
    TileSelectLayer,
    TokenLayer,
    TowerLayer,
    TowerSelectLayer,
    TunnelSelectLayer
  },

  data () {
    return {
      offsetX: 0,
      offsetY: 0
    }
  },

  computed: {
    ...mapState({
      layers: state => state.board.layers,
      dragging: state => state.board.dragging,
      zoom: state => state.board.zoom,
      elements: state => state.game.setup ? state.game.setup.elements : {}
    }),

    ...mapGetters({
      bounds: 'board/bounds'
    }),

    transform () {
      return `translate(${this.offsetX} ${this.offsetY}) scale(${this.zoom} ${this.zoom})`
    },

    tileSize () {
      return 1000 * this.zoom
    },

    boardWidth () {
      return this.bounds.width * this.tileSize
    },

    boardHeight () {
      return this.bounds.height * this.tileSize
    }
  },

  watch: {
    bounds (val) {
      this.boundingRectangle = null // clear cached value
    }
  },

  mounted () {
    const rect = this.$el.getBoundingClientRect()
    this.offsetX = parseInt((rect.width - this.boardWidth) / 2)
    this.offsetY = ACTION_PANEL_HEIGHT + parseInt((rect.height - this.boardHeight - ACTION_PANEL_HEIGHT) / 2)

    this.pressedKeys = {}
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  },

  methods: {
    onKeyDown (ev) {
      if (['a', 's', 'd', 'w'].includes(ev.key) !== -1) {
        this.pressedKeys[ev.key] = true
        if (!this.pressedKeysInterval) {
          this.pressedKeysInterval = setInterval(() => {
            let pressed = false
            if (this.pressedKeys.a) {
              this.offsetX -= KEY_PRESSED_OFFSET
              this.adjustAfterMove()
              pressed = true
            }
            if (this.pressedKeys.d) {
              this.offsetX += KEY_PRESSED_OFFSET
              this.adjustAfterMove()
              pressed = true
            }
            if (this.pressedKeys.s) {
              this.offsetY += KEY_PRESSED_OFFSET
              this.adjustAfterMove()
              pressed = true
            }
            if (this.pressedKeys.w) {
              this.offsetY -= KEY_PRESSED_OFFSET
              this.adjustAfterMove()
              pressed = true
            }
            if (!pressed) {
              clearInterval(this.pressedKeysInterval)
              this.pressedKeysInterval = null
            }
          }, 40)
        }
      }
    },

    onKeyUp (ev) {
      delete this.pressedKeys[ev.key]
    },

    onWheel (ev) {
      // TODO tune smoothness
      // TODO zoom to center
      const steps = -ev.deltaY / 65.0
      this.$store.commit('board/changeZoom', steps)
    },

    onMouseDown (ev) {
      if (ev.button === 0) {
        this.$store.commit('board/dragging', {
          offsetX: this.offsetX,
          offsetY: this.offsetY,
          x: ev.screenX,
          y: ev.screenY
        })
      }
    },

    onMouseMove (ev) {
      const d = this.dragging
      if (d) {
        const changeX = ev.screenX - d.x
        const changeY = ev.screenY - d.y
        this.offsetX = d.offsetX + changeX
        this.offsetY = d.offsetY + changeY
        this.adjustAfterMove()
      }
    },

    onMouseUp (ev) {
      if (ev.button === 0) {
        // let resolve first click handler
        // (it is ignored if mouse is )
        setTimeout(() => {
          Vue.nextTick(() => {
            this.$store.commit('board/dragging', null)
          })
        })
      }
    },

    onRightClick (ev) {
      this.$root.$emit('rclick', ev)
    },

    adjustAfterMove () {
      if (!this.boundingRectangle) {
        this.boundingRectangle = this.$refs.svg.getBoundingClientRect()
      }
      const { width, height } = this.boundingRectangle
      const minX = (0.1 - this.bounds.x[1]) * this.tileSize
      const maxX = width - (this.bounds.x[0] + 1.1) * this.tileSize
      // minY is little bit different because of action panel
      // allow 10% of last tile be hidden (not visible) but add 84 pixels for action panel height
      // so last tile's 10% is hidden under action panel
      const minY = (-0.1 - this.bounds.y[1]) * this.tileSize + 84
      const maxY = height - (this.bounds.y[0] + 1.1) * this.tileSize
      if (this.offsetX < minX) {
        this.offsetX = minX
      }
      if (this.offsetX > maxX) {
        this.offsetX = maxX
      }
      if (this.offsetY < minY) {
        this.offsetY = minY
      }
      if (this.offsetY > maxY) {
        this.offsetY = maxY
      }
    }
  }
}
</script>

<style>
</style>
