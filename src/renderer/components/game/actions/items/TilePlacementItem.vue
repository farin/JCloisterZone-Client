<template>
  <StandaloneTileImage :tile-id="tileId" :rotation="rotation" :class="{remote: !local}" />
</template>

<script>
import LayeredItemMixin from '@/components/game/actions/items/LayeredItemMixin.js'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

const getNextRotation = r => {
  if (r === 270) return 0
  return r + 90
}

export default {
  components: {
    StandaloneTileImage
  },

  mixins: [LayeredItemMixin],

  props: {
    tileId: { type: String, required: true },
    options: { type: Array, required: true },
    active: { type: Boolean },
    local: { type: Boolean }
  },

  data () {
    return {
      layer: 'TilePlacementLayer',
      rotation: 0
    }
  },

  computed: {
    layerProps () {
      return {
        tileId: this.tileId,
        rotation: this.rotation,
        options: this.options,
        local: this.local
      }
    }
  },

  mounted () {
    this.onRightClick = ev => {
      if (this.local) {
        const mouseOver = this.$store.state.board.tilePlacementMouseOver
        if (mouseOver) {
          const pos = mouseOver[0]
          const rotations = this.options.find(({ position: p }) => p[0] === pos[0] && p[1] === pos[1])?.rotations
          if (rotations?.length) {
            while (true) {
              this.rotation = getNextRotation(this.rotation)
              if (rotations.includes(this.rotation)) {
                return
              }
            }
          }
        }
        this.rotation = getNextRotation(this.rotation)
      }
    }
    this.$root.$on('rclick', this.onRightClick)
    this.$root.$on('tile-placement.select', this.onSelect)
  },

  beforeDestroy () {
    this.$root.$off('rclick', this.onRightClick)
    this.$root.$off('tile-placement.select', this.onSelect)
  },

  methods: {
    async onSelect ({ position, rotation }) {
      if (this.active && this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'PLACE_TILE',
          payload: {
            tileId: this.tileId,
            rotation: 'R' + rotation,
            position
          }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
svg
  margin: 0 30px

  &.remote
    filter: grayscale(1)

  &.remote:hover
    filter: none
</style>
