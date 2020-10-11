<template>
  <g id="tile-placement-layer">
    <g
      v-for="{ position: pos, rotations } in options"
      :key="positionAsKey(pos)"
      :transform="transformPosition(pos)"
    >
      <g
        v-if="mouseOver === pos"
        opacity="0.8"
        clip-path="polygon(0 0, 1000 0, 1000 1000, 0 1000)"
      >
        <image
          v-if="background"
          :href="background.image"
          :transform="backgroundScale"
        />
        <TileImage
          :tile-id="tileId"
          :rotation="getForcedRotation(rotations)"
        />
      </g>
      <rect
        v-else
        class="available-tile"
        :class="{ local }"
        :x="60" :y="60" width="880" height="880"
      />

      <!-- invisible rect for tracking mouse events -->
      <rect
        :x="0" :y="0" width="1000" height="1000"
        :style="{'pointer-events': 'all', fill: 'none'}"
        @mouseenter="local && onMouseOver(pos)"
        @mouseleave="local && onMouseLeave(pos)"
        @click="ev => local && onClick(ev, rotations, pos)"
      />
    </g>
  </g>
</template>

<script>
import LayerMixin from '@/components/game/layers/LayerMixin'
import TileImage from '@/components/game/TileImage'

export default {
  components: {
    TileImage
  },

  mixins: [LayerMixin],

  props: {
    tileId: { type: String, required: true },
    rotation: { type: Number, required: true },
    options: { type: Array, required: true },
    local: { type: Boolean }
  },

  data () {
    return {
      mouseOver: null
    }
  },

  computed: {
    background () {
      const artwork = this.$theme.getTileArtwork(this.tileId)
      return artwork ? artwork.background : null
    },

    backgroundScale () {
      const w = this.background.width / this.background.cols
      const h = this.background.height / this.background.rows
      return `scale(${1000 / w} ${1000 / h})`
    }
  },

  methods: {
    onMouseOver (pos) {
      this.mouseOver = pos
    },

    onMouseLeave (pos) {
      this.mouseOver = null
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
  stroke-width: 70px
  fill: none

  +theme using ($theme)
    stroke: map-get($theme, 'tile-placement-remote')

    &.local
      stroke: map-get($theme, 'tile-placement-local')

</style>
