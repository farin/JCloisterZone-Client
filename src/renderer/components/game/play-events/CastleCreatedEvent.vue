<template>
  <TokenImage
    token="CASTLE"
    :player="ev.player"
    :height="26"
    @mouseenter.native="onMouseEnter"
    @mouseleave.native="onMouseLeave"
  />
</template>

<script>
import TokenImage from '@/components/game/TokenImage'

export default {
  components: {
    TokenImage
  },

  props: {
    ev: { type: Object, required: true }
  },

  methods: {
    onMouseEnter () {
      this.$store.dispatch('board/showLayer', {
        layer: 'EmphasizeLayer',
        props: {
          emphasis: {
            type: 'castle',
            positions: this.ev.positions
          }
        }
      })
    },

    onMouseLeave () {
      this.$store.dispatch('board/hideLayerDebounced', { layer: 'EmphasizeLayer' })
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
