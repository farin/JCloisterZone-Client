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
        :x="60" :y="60" width="880" height="880"
      />

      <!-- invisible rect for tracking mouse events -->
      <rect
        :x="0" :y="0" width="1000" height="1000"
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

export default {
  mixins: [LayerMixin],

  props: {
    tileId: { type: String, required: true },
    rotation: { type: Number, required: true },
    options: { type: Array, required: true },
    local: { type: Boolean }
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
      return `scale(${1000 / w} ${1000 / h})`
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
      return rotations[0]
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
  stroke-width: 70px
  fill: none

  +theme using ($theme)
    stroke: map-get($theme, 'tile-placement-remote')

    &.local
      stroke: map-get($theme, 'tile-placement-local')

</style>
