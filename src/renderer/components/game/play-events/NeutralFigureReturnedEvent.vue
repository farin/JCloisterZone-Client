<template>
  <div
    class="one-square neutralfigure-returned"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <NeutralFigure
      :figure="ev.neutralfigure"
      :width="34" :height="34"
    />
    <v-icon>fas fa-slash</v-icon>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import NeutralFigure from '@/components/game/NeutralFigure'

export default {
  components: {
    NeutralFigure
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
      console.log(this.ev);
      this.$store.dispatch('board/showLayer', {
        layer: 'EmphasizeLayer',
        props: {
          emphasis: {
            type: 'neutralfigure',
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
.neutralfigure-returned
  position: relative

  i
    position: absolute
    left: -1px
    top: px
    font-size: 34px

    +theme using ($theme)
      color: map-get($theme, 'removed-color')
</style>
