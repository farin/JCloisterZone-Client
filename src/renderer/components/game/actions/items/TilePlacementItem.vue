<template>
  <StandaloneTileImage :tile-id="tileId" :rotation="rotation" :class="{remote: !local}" />
</template>

<script>
import LayeredItemMixin from '@/components/game/actions/items/LayeredItemMixin.js'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

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
        if (this.rotation === 270) {
          this.rotation = 0
        } else {
          this.rotation += 90
        }
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
