<template>
  <div>
    <svg class="meeple" :width="30" :height="30">
      <g>
        <use :href="`${MEEPLES_SVG}#small-follower`" x="0" y="0" />
        <use :href="`${MEEPLES_SVG}#small-follower`" x="15" y="15" />
        <use :href="`${MEEPLES_SVG}#small-follower`" x="-15" y="-15"/>
      </g>
    </svg>
    <v-icon class="color-overlay">fas fa-undo</v-icon>
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
