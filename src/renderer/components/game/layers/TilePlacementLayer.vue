<template>
  <g id="tile-placement-layer">
    <g
      v-for="{ position: pos, rotations } in options"
      :key="positionAsKey(pos)"
      :transform="transformPosition(pos)"
    >
      <rect
        v-if="!mouseOver || mouseOver[0] !== pos"
        class="available-tile"
        :class="{ local }"
        :x="BASE_SIZE * 0.06" :y="BASE_SIZE * 0.06" :width="BASE_SIZE * 0.88" :height="BASE_SIZE * 0.88"
      />

      <!-- invisible rect for tracking mouse events -->
      <rect
        :x="0" :y="0" :width="BASE_SIZE" :height="BASE_SIZE"
        :style="{'pointer-events': 'all', fill: 'none'}"
        @mouseenter="local && onMouseOver(pos, getForcedRotation(rotations))"
        @mouseleave="local && onMouseLeave()"
        @click="ev => local && onClick(ev, rotations, pos)"
      />
    </g>
  </g>
</template>

<script>
import { mapState } from 'vuex'
import LayerMixin from '@/components/game/layers/LayerMixin'
import { BASE_SIZE } from '@/constants/ui'

export default {
  mixins: [LayerMixin],

  props: {
    tileId: { type: String, required: true },
    rotation: { type: Number, required: true },
    options: { type: Array, required: true },
    local: { type: Boolean }
  },

  data () {
    return { BASE_SIZE }
  },

  computed: {
    ...mapState({
      mouseOver: state => state.board.tilePlacementMouseOver
    }),

    artwork () {
      return this.$theme.getTileArtwork(this.tileId)
    },

    background () {
      return this.artwork?.background
    },

    backgroundScale () {
      const w = this.background.width / this.background.cols
      const h = this.background.height / this.background.rows
      return `scale(${BASE_SIZE / w} ${BASE_SIZE / h})`
    }
  },

  watch: {
    rotation () {
      if (this.mouseOver) {
        const opt = this.options.find(({ position }) => position === this.mouseOver[0])
        opt && this.$store.commit('board/tilePlacementMouseOver', [this.mouseOver[0], this.getForcedRotation(opt.rotations)])
      }
    }
  },

  methods: {
    onMouseOver (position, rotation) {
      this.$store.commit('board/tilePlacementMouseOver', [position, rotation])
    },

    onMouseLeave () {
      this.$store.commit('board/tilePlacementMouseOver', null)
    },

    getForcedRotation (rotations) {
      if (rotations.length === 1) {
        return rotations[0]
      }
      if (this.$tiles.tiles[this.tileId].symmetry === 2 && rotations.length === 2) {
        if (rotations.includes(this.rotation)) {
          return this.rotation
        }
        return (this.rotation + 90) % 360
      }
      return this.rotation
    },

    onClick (ev, rotations, position) {
      if (this.isDragging(ev)) {
        return
      }

      const rotation = this.getForcedRotation(rotations)
      if (rotations.includes(rotation)) {
        this.$root.$emit('tile-placement.select', { position, rotation })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.available-tile
  stroke-width: 63px
  fill: none

  +theme using ($theme)
    stroke: map-get($theme, 'tile-placement-remote')

    &.local
      stroke: map-get($theme, 'tile-placement-local')

</style>
