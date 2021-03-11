<template>
  <img src="~/assets/figures/tower-alt.png" height="55">
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
      return [['TowerSelectLayer', {
        options: this.options
      }]]
    }
  },

  mounted () {
    this.$root.$on('tower.select', this.onSelect)
  },

  beforeDestroy () {
    this.$root.$off('tower.select', this.onSelect)
  },

  methods: {
    async onSelect (position) {
      if (this.active) {
        await this.$store.dispatch('game/apply', {
          type: 'PLACE_TOKEN',
          payload: {
            token: 'TOWER_PIECE',
            pointer: {
              position,
              location: 'TOWER'
            }
          }
        })
      }
    }
  }
}
</script>
