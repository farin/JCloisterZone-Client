<template>
  <svg>
    <use :href="TOKENS_SVG + '#bridge'" />
  </svg>
</template>

<script>
import LayeredItemMixin from '@/components/game/actions/items/LayeredItemMixin.js'

const TOKENS_SVG = require('~/assets/tokens.svg')

export default {
  mixins: [LayeredItemMixin],

  props: {
    options: { type: Array, required: true },
    active: { type: Boolean }
  },

  data () {
    return {
      TOKENS_SVG
    }
  },

  computed: {
    layers () {
      return [['BridgeSelectLayer', { options: this.options }]]
    }
  },

  mounted () {
    this.$root.$on('bridge.select', this.onSelect)
  },

  beforeDestroy () {
    this.$root.$off('bridge.select', this.onSelect)
  },

  methods: {
    async onSelect (option) {
      if (this.active) {
        await this.$store.dispatch('game/apply', {
          type: 'PLACE_TOKEN',
          payload: {
            token: 'BRIDGE',
            pointer: option
          }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
svg
  width: 70px
  height: 55px

  @media (max-height: 768px)
    width: 50px
    height: 39px

  +theme using ($theme)
    fill: map-get($theme, 'cards-text')

.active svg
  +theme using ($theme)
    fill: map-get($theme, 'text-color')
</style>
