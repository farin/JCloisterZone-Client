<template>
  <img
    src="~/assets/figures/bards_note.png"
    :height="$vuetify.breakpoint.height > 768 ? 55 : 39"
  >
</template>

<script>
import LayeredItemMixin from '@/components/game/actions/items/LayeredItemMixin.js'

export default {
  mixins: [LayeredItemMixin],

  props: {
    options: { type: Array, required: true },
    active: { type: Boolean }
  },

  computed: {
    layers () {
      return [['FeatureSelectLayer', {
        options: this.options
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
    async onSelect (opt) {
      if (this.active) {
        await this.$store.dispatch('game/apply', {
          type: 'PLACE_TOKEN',
          payload: {
            token: 'BARDS_NOTE',
            pointer: opt
          }
        })
      }
    }
  }
}
</script>
