<template>
  <svg
    class="miniboard"
    :viewBox="`0 0 ${BASE_SIZE * columns} ${BASE_SIZE * rows}`"
    v-bind="sizeAttrs"
  >
    <defs>
      <clipPath :id="`clip-${uuid}`">
        <rect x="0" y="0" :width="tileSize * columns" :height="tileSize * rows" />
      </clipPath>
    </defs>

    <g>
      <image
        v-if="background"
        :href="background.image"
        :clip-path="`url(#clip-${uuid})`"
      />

      <TileImage
        v-for="pt in tiles"
        :key="`${pt.x},${pt.y})`"
        :transform="`translate(${(pt.x + x) * tileSize} ${(pt.y + y) * tileSize})`"
        :tile-id="pt.tile"
        :rotation="pt.rotation"
      />
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
    size: { type: Number, default: null },
    tiles: { type: Array, required: true }
  },

  data () {
    return {
      uuid: uuidv4(),
      BASE_SIZE
    }
  },

  computed: {
    artwork () {
      return this.$theme.getTileArtwork(this.tiles[0].tile)
    },

    tileSize () {
      return this.artwork?.tileSize || BASE_SIZE
    },

    background () {
      return this.artwork?.background
    },

    x () {
      const xs = this.tiles.map(t => t.x)
      return 0 - Math.min(...xs)
    },

    y () {
      const ys = this.tiles.map(t => t.y)
      return 0 - Math.min(...ys)
    },

    columns () {
      const xs = this.tiles.map(t => t.x)
      return Math.max(...xs) - Math.min(...xs) + 1
    },

    rows () {
      const ys = this.tiles.map(t => t.y)
      return Math.max(...ys) - Math.min(...ys) + 1
    },

    sizeAttrs () {
      const { size } = this
      if (size !== null) {
        return { width: size * this.columns, height: size * this.rows }
      }
      return {}
    }
  }
}
</script>
