<template>
  <TokenImage
    :token="token"
    :player="player"
    :height="74"
    :inactive="!active"
  />
</template>

<script>
import TokenImage from '@/components/game/TokenImage'
import LayeredItemMixin from '@/components/game/actions/items/LayeredItemMixin.js'

export default {
  components: {
    TokenImage
  },

  mixins: [LayeredItemMixin],

  props: {
    player: { type: Number, required: true },
    token: { type: String, required: true },
    options: { type: Array, required: true },
    active: { type: Boolean }
  },

  data () {
    return {
      layer: 'TunnelSelectLayer'
    }
  },

  computed: {
    layerProps () {
      return {
        player: this.player,
        token: this.token,
        options: this.options
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
          type: 'PLACE_TOKEN',
          payload: {
            token: this.token,
            pointer: opt
          }
        })
      }
    }
  }
}
</script>
