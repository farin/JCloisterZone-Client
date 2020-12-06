<template>
  <svg
    class="tile-img"
    :viewBox="`0 0 ${artwork.tileSize} ${artwork.tileSize}`"
    v-bind="sizeAttrs"
  >
    <image
      v-if="background"
      :href="background.image"
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
    artwork () {
      return this.$theme.getTileArtwork(this.tileId)
    },

    background () {
      return this.artwork?.background
    },

    sizeAttrs () {
      const { size } = this
      if (size !== null) {
        return { width: size, height: size }
      }
      return {}
    }
  }
}
</script>
