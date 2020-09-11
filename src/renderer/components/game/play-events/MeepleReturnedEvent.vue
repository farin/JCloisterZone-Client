<template>
  <div
    class="one-square meeple-returned"
    :class="colorCssClass(ev.player)"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <Meeple :type="ev.meeple" />
    <v-icon>fas fa-slash</v-icon>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Meeple from '@/components/game/Meeple'

export default {
  components: {
    Meeple
  },

  props: {
    ev: { type: Object, required: true }
  },

  computed: mapGetters({
    tileOn: 'game/tileOn',
    colorCssClass: 'game/colorCssClass'
  }),

  methods: {
    onMouseEnter () {
      this.$store.dispatch('board/showLayer', {
        layer: 'EmphasizeLayer',
        props: {
          emphasis: {
            type: 'meeple',
            ...this.ev.from
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
.meeple-returned
  position: relative

  i
    position: absolute
    left: -1px
    top: 2px
    font-size: 34px
    color: $removed-color
</style>
