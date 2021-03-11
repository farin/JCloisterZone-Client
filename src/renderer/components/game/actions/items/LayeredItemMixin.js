import Vue from 'vue'

export default {
  watch: {
    active (val) {
      if (val) {
        this.showLayer()
      } else {
        this.hideLayer()
      }
    },

    layers (val) {
      if (this.active) {
        this.showLayer()
      }
    }
  },

  mounted () {
    if (this.active) {
      this.showLayer()
    }
  },

  beforeDestroy () {
    if (this.active) {
      this.hideLayer()
    }
  },

  methods: {
    showLayer () {
      // wait for parallel hide called from other items. hide must be resolved first
      Vue.nextTick(() => {
        this.layers.forEach(([layer, props]) => {
          this.$store.dispatch('board/showLayer', { layer, props })
        })
      })
    },

    hideLayer () {
      this.layers.forEach(([layer]) => {
        this.$store.dispatch('board/hideLayer', { layer })
      })
    }
  }
}
