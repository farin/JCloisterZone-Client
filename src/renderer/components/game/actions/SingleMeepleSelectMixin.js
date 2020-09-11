export default {
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
    this.$root.$on('meeple.select', this.onSelect)
    this.showLayer()
  },

  beforeDestroy () {
    this.$root.$off('meeple.select', this.onSelect)
    this.hideLayer()
  },

  methods: {
    showLayer () {
      this.$store.dispatch('board/showLayer', {
        layer: 'MeepleSelectLayer',
        props: {
          options: this.actionItem.options
        }
      })
    },

    hideLayer () {
      this.$store.dispatch('board/hideLayer', { layer: 'MeepleSelectLayer' })
    }
  }
}
