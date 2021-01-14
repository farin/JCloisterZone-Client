<template>
  <svg
    ref="svg"
    class="board"
    :class="{ 'overlay': overlay }"
    draggable
    @wheel.passive="onWheel"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @click.right="onRightClick"
  >
    <g :transform="transform">
      <TileLayer />
      <TilePlacementLayer
        v-if="layers.TilePlacementLayer"
        v-bind="layers.TilePlacementLayer"
      />
      <CastleLayer v-if="elements.castle" />
      <TowerLayer v-if="elements.tower" />
      <TokenLayer />
      <FlierLayer />
      <MeepleLayer />
      <BridgeLayer v-if="elements.bridge" />
      <MeepleLayer deployed-on-bridge />
    </g>
    <EmphasizeLayer
      v-if="layers.EmphasizeLayer"
      v-bind="layers.EmphasizeLayer"
      :global-transform="transform"
    />
    <g :transform="transform">
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
      offsetY: 0,
      overlay: false
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
      return Math.round(1000 * this.zoom)
    },

    boardWidth () {
      return this.bounds.width * this.tileSize
    },

    boardHeight () {
      return this.bounds.height * this.tileSize
    }
  },

  mounted () {
    const rect = this.$el.getBoundingClientRect()
    if (this.boardWidth > rect.width) {
      this.offsetX = parseInt(rect.width / 2)
    } else {
      this.offsetX = parseInt((rect.width - this.boardWidth) / 2)
    }
    if (this.boardHeight > rect.height - ACTION_PANEL_HEIGHT) {
      this.offsetY = ACTION_PANEL_HEIGHT + parseInt((rect.height - ACTION_PANEL_HEIGHT) / 2)
    } else {
      this.offsetY = ACTION_PANEL_HEIGHT + parseInt((rect.height - this.boardHeight - ACTION_PANEL_HEIGHT) / 2)
    }

    this.pressedKeys = {}
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('mouseup', this.onMouseUp) // reset it even if mouse is putside
    this.$root.$on('request-zoom', this.onRequestZoom)
  },

  beforeDestroy () {
    clearInterval(this.pressedKeysInterval)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('mouseup', this.onMouseUp)
    this.$root.$off('request-zoom', this.onRequestZoom)
  },

  methods: {
    onKeyDown (ev) {
      if (['a', 's', 'd', 'w'].includes(ev.key) && !this.$store.state.gameDialog) {
        if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) {
          return
        }
        this.pressedKeys[ev.key] = true
        if (!this.pressedKeysInterval) {
          this.pressedKeysInterval = setInterval(() => {
            let pressed = false
            if (this.pressedKeys.a) {
              this.offsetX -= KEY_PRESSED_OFFSET
              pressed = true
            }
            if (this.pressedKeys.d) {
              this.offsetX += KEY_PRESSED_OFFSET
              pressed = true
            }
            if (this.pressedKeys.s) {
              this.offsetY += KEY_PRESSED_OFFSET
              pressed = true
            }
            if (this.pressedKeys.w) {
              this.offsetY -= KEY_PRESSED_OFFSET
              pressed = true
            }
            if (pressed) {
              this.adjustAfterMove()
            } else {
              clearInterval(this.pressedKeysInterval)
              this.pressedKeysInterval = null
            }
          }, 40)
        }
      }
      if (ev.key === 'Shift') {
        this.overlay = true
      }
    },

    onKeyUp (ev) {
      delete this.pressedKeys[ev.key]
      if (ev.key === 'Shift') {
        this.overlay = false
      }
    },

    onWheel (ev) {
      const steps = -ev.deltaY / 140.0
      this.changeZoom(ev.offsetX, ev.offsetY, steps)
    },

    onRequestZoom (change) {
      const { width, height } = this.$refs.svg.getBoundingClientRect()
      const adjustedWidth = width - 210 - 80 // approx 210px for players panel and 80 px for history
      const adjustedHeight = height - 84 // action panel
      const eventX = 80 + adjustedWidth / 2
      const eventY = 84 + adjustedHeight / 2
      this.changeZoom(eventX, eventY, change)
    },

    changeZoom (eventX, eventY, change) {
      const pointerX = (eventX - this.offsetX) / this.tileSize
      const pointerY = (eventY - this.offsetY) / this.tileSize
      this.$store.commit('board/changeZoom', change)

      this.offsetX = -(pointerX * this.tileSize - eventX)
      this.offsetY = -(pointerY * this.tileSize - eventY)
      this.adjustAfterMove()
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
            this.dragging && this.$store.commit('board/dragging', null)
          })
        })
      }
    },

    onRightClick (ev) {
      this.$root.$emit('rclick', ev)
    },

    adjustAfterMove () {
      const { width, height } = this.$refs.svg.getBoundingClientRect()
      const adjustedWidth = width - 210 - 80 // approx 210px for players panel and 80 px for history
      const adjustedHeight = height - 84 // action panel
      const minX = parseInt(-(-0.3 + this.bounds.width + this.bounds.x) * this.tileSize + 80 + adjustedWidth / 3)
      const maxX = parseInt((-0.3 - this.bounds.x) * this.tileSize + (80 + adjustedWidth / 3 * 2))
      const minY = parseInt(-(-0.3 + this.bounds.height + this.bounds.y) * this.tileSize + 84 + adjustedHeight / 3)
      const maxY = parseInt((-0.3 - this.bounds.y) * this.tileSize + (84 + adjustedHeight / 3 * 2))
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
