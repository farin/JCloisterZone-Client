<template>
  <svg
    class="miniboard"
    :width="tileSize * columns" :height="tileSize * rows"
    :viewBox="`0 0 ${1000 * columns} ${1000 * rows}`"
  >
    <TileImage
      v-for="pt in tiles"
      :key="`${pt.x},${pt.y})`"
      :transform="`translate(${(pt.x + x) * 1000} ${(pt.y + y) * 1000})`"
      :tile-id="pt.tile"
      :rotation="pt.rotation"
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
    tileSize: { type: Number, required: true },
    tiles: { type: Array, required: true }
  },

  computed: {
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
    }
  }
}
</script>
