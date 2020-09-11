<template>
  <TokenImage
    :class="cssClass"
    :token="ev.token"
    :player="player"
    :height="height"
    @mouseenter.native="onMouseEnter"
    @mouseleave.native="onMouseLeave"
  />
</template>

<script>
import TokenImage from '@/components/game/TokenImage'

const FULL_SIZE_TOKENS = new Set(['WOLF', 'SHEEP', 'TUNNEL', 'FERRY', 'LB'])

export default {
  components: {
    TokenImage
  },

  props: {
    ev: { type: Object, required: true },
    player: { type: Number, default: null }
  },

  computed: {
    height () {
      if (this.ev.token === 'GOLD') {
        return 21
      }
      const baseName = this.ev.token.split('_')[0]
      return FULL_SIZE_TOKENS.has(baseName) ? 40 : 26
    },

    cssClass () {
      if (this.ev.token === 'FERRY') {
        const { location } = this.ev.to
        return `token-FERRY location-${location}`
      }
      return ''
    }
  },

  methods: {
    onMouseEnter () {
      let emphasis
      if (this.ev.token === 'BRIDGE' || this.ev.token === 'FERRY') {
        emphasis = {
          type: 'tile',
          position: this.ev.to.position
        }
      } else if (this.ev.token === 'GOLD' || this.ev.token.startsWith('LB_')) {
        emphasis = {
          type: 'tile',
          position: this.ev.to
        }
      } else {
        emphasis = {
          type: 'meeple',
          ...this.ev.to
        }
      }
      this.$store.dispatch('board/showLayer', {
        layer: 'EmphasizeLayer',
        props: {
          emphasis
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
// svg
//   width: 34px
//   height: 34px
.token-image
  display: flex
  justify-content: center
  align-items: center

.token-FERRY
  background-image: url('~assets/icons/water.jpg')
</style>

<style lang="sass">
.token-FERRY
  &.location-NS svg
    transform: rotate(90deg)

  &.location-NW svg
    transform: translate(-4px, -4px) rotate(-45deg)

  &.location-SW svg
    transform: translate(-4px, 4px) rotate(45deg)

  &.location-NE svg
    transform: translate(4px, -4px) rotate(45deg)

  &.location-SE svg
    transform: translate(4px, 4px) rotate(-45deg)
</style>
