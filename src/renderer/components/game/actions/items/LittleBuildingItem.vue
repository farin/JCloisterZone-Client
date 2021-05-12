<template>
  <TokenImage :token="token" :height="$vuetify.breakpoint.height > 768 ? 70 : 50" />
</template>

<script>
import LayeredItemMixin from '@/components/game/actions/items/LayeredItemMixin.js'
import TokenImage from '@/components/game/TokenImage'

export default {
  components: {
    TokenImage
  },

  mixins: [LayeredItemMixin],

  props: {
    token: { type: String, required: true },
    position: { type: Array, required: true },
    active: { type: Boolean }
  },

  computed: {
    layers () {
      return [['TileSelectLayer', {
        options: [this.position],
        color: 'black'
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
          type: 'PLACE_TOKEN',
          payload: {
            token: this.token,
            pointer: this.position
          }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
