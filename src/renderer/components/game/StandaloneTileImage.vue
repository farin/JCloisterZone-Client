<template>
  <svg
    class="tile-img"
    viewBox="0 0 1000 1000"
    v-bind="sizeAttrs"
  >
    <image
      v-if="background"
      :href="background.image"
      :transform="backgroundScale"
    />
    <TileImage
      :tile-id="tileId"
      :rotation="rotation"
    />
  </svg>
</template>

<script>
import TileImage from '@/components/game/TileImage'

export default {
  components: {
    TileImage
  },

  props: {
    tileId: { type: String, required: true },
    rotation: { type: Number, default: 0 },
    size: { type: Number, default: null }
  },

  computed: {
    background () {
      const tile = this.$theme.getTileArtwork(this.tileId)
      return tile ? tile.background : null
    },

    sizeAttrs () {
      const { size } = this
      if (size !== null) {
        return { width: size, height: size }
      }
      return {}
    },

    backgroundScale () {
      const w = this.background.width / this.background.cols
      const h = this.background.height / this.background.rows
      return `scale(${1000 / w} ${1000 / h})`
    }
  }
}
</script>
