<template>
  <Miniboard
    :tile-size="tileSize"
    :tiles="countTiles"
  />
</template>

<script>
import Miniboard from '@/components/game-setup/Miniboard'

export default {
  components: {
    Miniboard
  },

  props: {
    tileSize: { type: Number, required: true }
  },

  data () {
    return {
      countTiles: [
        { tile: 'CO/1', x: -2, y: -1, rotation: 0 },
        { tile: 'CO/2', x: -1, y: -1, rotation: 0 },
        { tile: 'CO/3', x: 0, y: -1, rotation: 0 },
        { tile: 'CO/4', x: 1, y: -1, rotation: 0 },
        { tile: 'CO/5', x: -2, y: 0, rotation: 0 },
        { tile: 'CO/6', x: -1, y: 0, rotation: 0 },
        { tile: 'CO/7', x: 0, y: 0, rotation: 0 },
        { tile: 'CO/8', x: 1, y: 0, rotation: 0 },
        { tile: 'CO/9', x: -2, y: 1, rotation: 0 },
        { tile: 'CO/10', x: -1, y: 1, rotation: 0 },
        { tile: 'CO/11', x: 0, y: 1, rotation: 0 },
        { tile: 'CO/12', x: 1, y: 1, rotation: 0 }
      ]
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
