<template>
  <NeutralFigure :figure="figure" />
</template>

<script>
import { mapGetters } from 'vuex'

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

  data () {
    return {
      layer: 'FeatureSelectLayer'
    }
  },

  computed: {
    ...mapGetters({
      featureOn: 'game/featureOn'
    }),

    figure () {
      return this.figureId.split('.')[0]
    },

    layerProps () {
      return {
        player: this.player,
        options: this.options,
        cssClass: this.figure
      }
    }
  },

  mounted () {
    this.$root.$on('feature.select', this.onSelect)
  },

  beforeDestroy () {
    this.$root.$off('feature.select', this.onSelect)
  },

  methods: {
    async onSelect (opt) {
      if (this.active) {
        await this.$store.dispatch('game/apply', {
          type: 'MOVE_NEUTRAL_FIGURE',
          payload: {
            figureId: this.figureId,
            to: opt
          }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
svg
  width: 74px
  height: 74px

svg.inactive
  fill: #999
  color: white
</style>
