<template>
  <Meeple
    :class="{inactive: !active, [colorCssClass(player)]: active}"
    :type="meeple"
  />
</template>

<script>
import { mapGetters } from 'vuex'

import Meeple from '@/components/game/Meeple'
import LayeredItemMixin from '@/components/game/actions/items/LayeredItemMixin.js'

const FEATURE_QUARTERS = {
  City: 'QUARTER_CASTLE',
  Monastery: 'QUARTER_CATHEDRAL',
  Field: 'QUARTER_MARKET',
  Road: 'QUARTER_BLACKSMITH'
}

export default {
  components: {
    Meeple
  },

  mixins: [LayeredItemMixin],

  props: {
    player: { type: Number, required: true },
    meeple: { type: String, required: true },
    options: { type: Array, required: true },
    phase: { type: String, required: true },
    origin: { type: Object, default: null },
    active: { type: Boolean },
    coc: { type: Boolean }
  },

  computed: {
    ...mapGetters({
      meepleIdFromSupply: 'game/meepleIdFromSupply',
      colorCssClass: 'game/colorCssClass'
    }),

    layers () {
      const layers = [['FeatureSelectLayer', {
        player: this.player,
        options: this.options,
        meeple: this.meeple
      }]]
      if (this.phase === 'WagonPhase') {
        layers.push(['WagonPhaseLayer', {
          origin: this.origin
        }])
      }

      return layers
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
        let meepleId
        if (this.coc) {
          const quarter = FEATURE_QUARTERS[opt.feature]
          meepleId = this.$store.state.game.deployedMeeples.find(m => m.player === this.player && m.location === quarter && m.type === this.meeple).id
        } else {
          meepleId = this.meepleIdFromSupply(this.player, this.meeple)
        }

        await this.$store.dispatch('game/apply', {
          type: 'DEPLOY_MEEPLE',
          payload: {
            pointer: opt,
            meepleId
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

  @media (max-height: 768px)
    width: 54px
    height: 54px

svg.inactive
  +theme using ($theme)
    fill: map-get($theme, 'action-panel-disabled-fill')
    color: map-get($theme, 'action-panel-disabled-overlay')
</style>
