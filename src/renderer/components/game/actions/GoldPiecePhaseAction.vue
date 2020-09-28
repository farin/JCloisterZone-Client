<template>
  <section>
    <div class="text">
      {{ local ? 'Place a gold ingot' : 'Player must place a gold ingot' }}
      <img src="~/assets/figures/gold.png" height="30">
    </div>
    <slot
      plain
      label="Done"
    />
  </section>
</template>

<script>
export default {
  props: {
    action: { type: Object, required: true },
    phase: { type: String, required: true },
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
    this.$root.$on('tile.select', this.onSelect)
    this.showLayer()
  },

  beforeDestroy () {
    this.$root.$off('tile.select', this.onSelect)
    this.hideLayer()
  },

  methods: {
    showLayer () {
      if (this.local) {
        this.$store.dispatch('board/showLayer', {
          layer: 'TileSelectLayer',
          props: {
            options: this.actionItem.options,
            color: 'gold'
          }
        })
      }
    },

    hideLayer () {
      if (this.local) {
        this.$store.dispatch('board/hideLayer', { layer: 'TileSelectLayer' })
      }
    },

    async onSelect (opt) {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'PLACE_TOKEN',
          payload: {
            token: 'GOLD',
            pointer: opt
          }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
img
  margin-left: 30px
</style>
