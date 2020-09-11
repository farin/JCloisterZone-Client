<template>
  <section>
    <div class="text">
      Place a gold ingot <img src="~/assets/figures/gold.png" height="30">
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
    phase: { type: String, required: true }
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
      this.$store.dispatch('board/showLayer', {
        layer: 'TileSelectLayer',
        props: {
          options: this.actionItem.options,
          color: 'gold'
        }
      })
    },

    hideLayer () {
      this.$store.dispatch('board/hideLayer', { layer: 'TileSelectLayer' })
    },

    async onSelect (opt) {
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
</script>

<style lang="sass" scoped>
img
  margin-left: 30px
</style>
