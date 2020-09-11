<template>
  <div
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <svg viewBox="0 0 120 120">
      <rect width="120" height="120" fill="white" />
      <circle v-if="ev.distance === 1 || ev.distance === 3" cx="60" cy="60" r="12" />
      <circle v-if="ev.distance === 3" cx="90" cy="30" r="12" />
      <circle v-if="ev.distance === 3" cx="30" cy="90" r="12" />
      <circle v-if="ev.distance === 2" cx="40" cy="80" r="12" />
      <circle v-if="ev.distance === 2" cx="80" cy="40" r="12" />
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    ev: { type: Object, required: true }
  },

  methods: {
    onMouseEnter () {
      this.$store.dispatch('board/showLayer', {
        layer: 'EmphasizeLayer',
        props: {
          emphasis: {
            type: 'tile',
            position: this.ev.flierPosition
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
svg
  display: block
  width: 40px
  height: 40px
</style>
