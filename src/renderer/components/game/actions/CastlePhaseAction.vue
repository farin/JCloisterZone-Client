<template>
  <section :class="{remote: !local}">
    <span class="text">{{ local ? 'You are allowed to place' : 'Player is allowed to place' }}</span>
    <img src="~/assets/figures/castle.png" height="70">
    <slot />
  </section>
</template>

<script>
export default {
  props: {
    action: { type: Object, required: true },
    local: { type: Boolean }
  },

  computed: {
    actionItem () {
      return this.action.items[0]
    }
  },

  watch: {
    actionItem (val) {
      this.showLayer()
    }
  },

  mounted () {
    if (this.local) {
      this.$root.$on('feature.select', this.onSelect)
      this.showLayer()
    }
  },

  beforeDestroy () {
    this.$root.$off('feature.select', this.onSelect)
    this.hideLayer()
  },

  methods: {
    showLayer () {
      this.$store.dispatch('board/showLayer', {
        layer: 'CastleBaseSelectLayer',
        props: {
          player: this.action.player,
          options: this.actionItem.options
        }
      })
    },

    hideLayer () {
      this.$store.dispatch('board/hideLayer', { layer: 'CastleBaseSelectLayer' })
    },

    async onSelect (option) {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'PLACE_TOKEN',
          payload: {
            token: 'CASTLE',
            pointer: option
          }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.text
  font-size: 20px
  font-weight: 300

img
  margin: 0 10px 0 30px

.remote img
  filter: grayscale(1)

  &:hover
    filter: none

</style>
