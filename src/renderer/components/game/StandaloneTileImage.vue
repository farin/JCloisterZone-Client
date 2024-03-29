<template>
  <svg
    class="tile-img"
    :data-tile-id="tileId"
    :viewBox="`${-padding[0]} ${-padding[1]} ${tileSize + 2 * padding[0]} ${tileSize + 2 * padding[1]}`"
    v-bind="sizeAttrs"
  >
    <defs>
      <clipPath :id="`clip-${uuid}`">
        <rect x="0" y="0" :width="tileSize" :height="tileSize" />
      </clipPath>
    </defs>

    <g>
      <image
        v-if="background"
        :href="background.image"
        :clip-path="`url(#clip-${uuid})`"
      />
      <TileImage
        :tile-id="tileId"
        :rotation="rotation"
      />

      <slot :tile-size="tileSize" :artwork="artwork" />
    </g>
  </svg>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import TileImage from '@/components/game/TileImage'
import { BASE_SIZE } from '@/constants/ui'

export default {
  components: {
    TileImage
  },

  props: {
    tileId: { type: String, required: true },
    rotation: { type: Number, default: 0 },
    size: { type: Number, default: null },
    padding: { type: Array, default: () => [0, 0] }
  },

  data () {
    return {
      uuid: uuidv4()
    }
  },

  computed: {
    artwork () {
      return this.$theme.getTileArtwork(this.tileId)
    },

    tileSize () {
      return this.artwork?.tileSize || BASE_SIZE
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
