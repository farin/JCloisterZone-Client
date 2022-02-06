<template>
  <svg
    class="meeple"
    :class="{inactive: !active, [colorCssClass(player)]: active}"
    :width="$vuetify.breakpoint.height > 768 ? 70 : 50"
    :height="$vuetify.breakpoint.height > 768 ? 70 : 50"
    viewBox="0 0 55 55"
  >
    <g transform="scale(0.55)">
      <use :href="`${MEEPLES_SVG}#small-follower`" x="22" y="0" />
      <use :href="`${MEEPLES_SVG}#small-follower`" x="-1" y="41" />
      <use :href="`${MEEPLES_SVG}#small-follower`" x="46" y="41" />
    </g>
  </svg>
</template>

<script>
import { mapGetters } from 'vuex'

import LayeredItemMixin from '@/components/game/actions/items/LayeredItemMixin.js'
const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  mixins: [LayeredItemMixin],

  props: {
    player: { type: Number, required: true },
    options: { type: Array, required: true },
    active: { type: Boolean }
  },

  data () {
    return { MEEPLES_SVG }
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass'
    }),

    layers () {
      return [['FeatureSelectLayer', {
        player: this.player,
        options: this.options,
        meeple: 'smallfollower'
      }]]
    }
  },

  mounted () {
    this.$root.$on('feature.select', this.onSelect)
  },

  beforeDestroy () {
    this.$root.$off('feature.select', this.onSelect)
  },

  methods: {
    async onSelect (pointer) {
      if (this.active) {
        await this.$store.dispatch('game/apply', {
          type: 'SCORE_ACROBATS',
          payload: { pointer }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
svg.inactive
  +theme using ($theme)
    fill: map-get($theme, 'action-panel-disabled-fill')
    color: map-get($theme, 'action-panel-disabled-overlay')
</style>
