<template>
  <NeutralFigure
    figure="fairy"
    :width="$vuetify.breakpoint.height > 768 ? 74 : 50"
    :height="$vuetify.breakpoint.height > 768 ? 74 : 50"
  />
</template>

<script>
import LayeredItemMixin from '@/components/game/actions/items/LayeredItemMixin.js'
import NeutralFigure from '@/components/game/NeutralFigure'

export default {
  components: {
    NeutralFigure
  },

  mixins: [LayeredItemMixin],

  props: {
    figureId: { type: String, required: true },
    options: { type: Array, required: true },
    active: { type: Boolean }
  },

  computed: {
    layers () {
      return [['TileSelectLayer', {
        options: this.options,
        color: '#fdf1d7'
      }]]
    }
  },

  mounted () {
    this.$root.$on('tile.select', this.onSelect)
  },

  beforeDestroy () {
    this.$root.$off('tile.select', this.onSelect)
  },

  methods: {
    async onSelect (position) {
      if (this.active) {
        await this.$store.dispatch('game/apply', {
          type: 'MOVE_NEUTRAL_FIGURE',
          payload: {
            figureId: this.figureId,
            to: position
          }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
svg.fairy
  fill: #999
  position: relative
  top: -10px

.active
  svg.fairy
    fill: $fairy-color
</style>
