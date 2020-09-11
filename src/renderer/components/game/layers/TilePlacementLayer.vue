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
        :x="60" :y="60" width="880" height="880"
        :style="{stroke: '#c0c0c0', strokeWidth: 70, fill: 'none'}"
      />

      <!-- invisible rect for tracking mouse events -->
      <rect
        :x="0" :y="0" width="1000" height="1000"
        :style="{'pointer-events': 'all', fill: 'none'}"
        @mouseenter="onMouseOver(pos)"
        @mouseleave="onMouseLeave(pos)"
        @click="ev => onClick(ev, rotations, pos)"
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
    options: { type: Array, required: true }
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

<style>
</style>
