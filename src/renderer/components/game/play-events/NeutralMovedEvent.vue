<template>
  <div
    class="neutral-moved"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <NeutralFigure :figure="figure" :width="34" :height="34" />
    <v-icon v-if="!ev.to">fas fa-slash</v-icon>
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

  computed: {
    ...mapGetters({ tileOn: 'game/tileOn' }),

    figure () {
      return this.ev.figure.split('.')[0]
    }
  },

  methods: {
    onMouseEnter () {
      console.log(this.ev);
      const { to } = this.ev
      if (!to) {
        return
      }

      let fp = null
      if (to.featurePointer) {
        fp = to.featurePointer
      } else if (to.position && to.location) {
        fp = to
      }

      if (fp) {
        this.$store.dispatch('board/showLayer', {
          layer: 'EmphasizeLayer',
          props: {
            emphasis: {
              type: 'meeple',
              ...fp
            }
          }
        })
      } else if (this.ev.to.length === 2) { // position
        this.$store.dispatch('board/showLayer', {
          layer: 'EmphasizeLayer',
          props: {
            emphasis: {
              type: 'tile',
              position: this.ev.to
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
.neutral-moved
  position: relative

  i
    position: absolute
    left: -1px
    top: 2px
    font-size: 34px

    +theme using ($theme)
      color: map-get($theme, 'removed-color')
</style>
