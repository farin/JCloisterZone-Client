<template>
  <div class="points-source">
    <div
      v-for="(p, idx) in ev.points"
      :key="idx"
      :class="'points ' + colorCssClass(p.player)"
      @mouseenter="onMouseEnter(p)"
      @mouseleave="onMouseLeave()"
      @click="persistBreakdown = !persistBreakdown"
    >
      {{ p.points }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    ev: { type: Object, required: true }
  },

  data () {
    return {
      persistBreakdown: false
    }
  },

  computed: {
    ...mapGetters({
      tileOn: 'game/tileOn',
      featureOn: 'game/featureOn',
      colorCssClass: 'game/colorCssClass'
    })
  },

  methods: {
    onMouseEnter (points) {
      this.persistBreakdown = false
      const { ptr } = points
      if (ptr) {
        if (Array.isArray(ptr)) {
          this.$store.dispatch('board/showLayer', {
            layer: 'EmphasizeLayer',
            props: {
              emphasis: {
                type: 'tile',
                position: ptr
              }
            }
          })
        } else {
          const feature = this.featureOn(ptr)
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
      }
      this.$store.commit('board/pointsExpression', points)
    },

    onMouseLeave () {
      this.$store.dispatch('board/hideLayerDebounced', { layer: 'EmphasizeLayer' })
      if (!this.persistBreakdown) {
        this.$store.commit('board/pointsExpression', null)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.points-source
  display: flex

.points
  width: 40px
  height: 26px
  text-align: center
  font-size: 18px
  cursor: pointer

  &:first-child
    border-radius: 13px 0 0 13px

  &:last-child
    border-radius: 0 13px 13px 0

  &:first-child:last-child
    border-radius: 13px
</style>
