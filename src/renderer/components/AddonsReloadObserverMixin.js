import debounce from 'lodash/debounce'

export default {

  mounted () {
    this.onLoad = debounce(() => {
      this.afterAddonsReloaded()
    }, 30)
    this.$theme.on('load', this.onLoad)
    this.$tiles.on('load', this.onLoad)
  },

  beforeDestroy () {
    this.$theme.off('load', this.onLoad)
    this.$tiles.off('load', this.onLoad)
  }
}
