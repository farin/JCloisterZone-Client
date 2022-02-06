<template>
  <div
    class="token-received points"
    :class="{[colorCssClass(ev.player)]: true, wide: ev.count > 1}"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <span v-if="ev.count > 1" class="count">{{ ev.count }}&thinsp;&times;&thinsp;</span>
    <TokenImage :token="ev.token" :player="ev.player" :height="ev.token === 'GOLD' ? 20 : 26" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import TokenImage from '@/components/game/TokenImage'

export default {
  components: {
    TokenImage
  },

  props: {
    ev: { type: Object, required: true }
  },

  computed: {
    ...mapGetters({
      tileOn: 'game/tileOn',
      featureOn: 'game/featureOn',
      colorCssClass: 'game/colorCssClass'
    })
  },

  methods: {
    onMouseEnter () {
      if (this.ev.feature) {
        const feature = this.featureOn(this.ev.feature)
        const places = feature.places.map(p => {
          return {
            tile: this.tileOn(p),
            feature: feature.type,
            location: p[2]
          }
        })
        this.$store.dispatch('board/showLayer', {
          layer: 'EmphasizeLayer',
          props: {
            emphasis: {
              type: 'feature',
              places
            }
          }
        })
      }
    },

    onMouseLeave () {
      this.$store.dispatch('board/hideLayerDebounced', { layer: 'EmphasizeLayer' })
    }
  }
}
</script>

<style lang="sass" scoped>
.token-received
  width: 40px
  height: 26px
  font-size: 18px
  border-radius: 13px
  display: flex
  justify-content: center
  align-items: stretch

  &.wide
    width: 80px
</style>
