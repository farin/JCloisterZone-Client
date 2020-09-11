<template>
  <section>
    <div class="text">
      {{ phase === 'PlaceFerryPhase' ? 'Place a ferry' : 'You can move ferries' }} <img src="~/assets/figures/ferry.png" height="30">
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
    this.$root.$on('ferry.select', this.onSelect)
    this.showLayer()
  },

  beforeDestroy () {
    this.$root.$off('ferry.select', this.onSelect)
    this.hideLayer()
  },

  methods: {
    showLayer () {
      this.$store.dispatch('board/showLayer', {
        layer: 'FerryChangeLayer',
        props: {
          options: this.actionItem.options
        }
      })
    },

    hideLayer () {
      this.$store.dispatch('board/hideLayer', { layer: 'FerryChangeLayer' })
    },

    async onSelect (opt) {
      await this.$store.dispatch('game/apply', {
        type: 'PLACE_TOKEN',
        payload: {
          token: 'FERRY',
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
