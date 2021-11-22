<template>
  <div :class="{ active }">
    <svg class="meeple color color-1" :width="50" :height="50">
      <g transform="translate(0 25) scale(0.5)">
        <use :href="`${MEEPLES_SVG}#small-follower`" />
      </g>
      <g transform="translate(12.5 0) scale(0.5)">
        <use :href="`${MEEPLES_SVG}#small-follower`" />
      </g>
      <g transform="translate(25 25) scale(0.5)">
        <use :href="`${MEEPLES_SVG}#small-follower`" />
      </g>
    </svg>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import LayeredItemMixin from '@/components/game/actions/items/LayeredItemMixin.js'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  mixins: [LayeredItemMixin],

  props: {
    options: { type: Array, required: true },
    active: { type: Boolean }
  },

  data () {
    return {
      MEEPLES_SVG
    }
  },

  computed: {
    layers () {
      const layers = [['FeatureSelectLayer', {
        player: this.player,
        options: this.options,
        meeple: this.meeple
      }]]
      
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
    async onSelect (position) {
      if (this.active) {
        await this.$store.dispatch('game/apply', {
          type: 'ACROBATS_SCORE',
          payload: {
            pointer: position
          }
        })
      }
    }
  }
}
</script>
