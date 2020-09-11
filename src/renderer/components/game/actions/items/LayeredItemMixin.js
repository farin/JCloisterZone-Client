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

    layerProps (val) {
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
        this.$store.dispatch('board/showLayer', {
          layer: this.layer,
          props: this.layerProps
        })
      })
    },

    hideLayer () {
      this.$store.dispatch('board/hideLayer', { layer: this.layer })
    }
  }
}
