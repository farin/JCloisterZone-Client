<template>
  <section>
    <span class="text">{{ local ? 'You can move the Count' : 'Player can move the Count' }}</span>
    <NeutralFigure figure="count" />
    <slot />
  </section>
</template>

<script>
import NeutralFigure from '@/components/game/NeutralFigure'

export default {
  components: {
    NeutralFigure
  },

  props: {
    action: { type: Object, required: true },
    local: { type: Boolean }
  },

  computed: {
    actionItem () {
      return this.action.items[0]
    }
  },

  watch: {
    actionItem (val) {
      this.showLayer()
    }
  },

  mounted () {
    this.$root.$on('feature.select', this.onSelect)
    this.showLayer()
  },

  beforeDestroy () {
    this.$root.$off('feature.select', this.onSelect)
    this.hideLayer()
  },

  methods: {
    showLayer () {
      this.$store.dispatch('board/showLayer', {
        layer: 'FeatureSelectLayer',
        props: {
          player: this.action.player,
          options: this.actionItem.options
        }
      })
    },

    hideLayer () {
      this.$store.dispatch('board/hideLayer', { layer: 'FeatureSelectLayer' })
    },

    async onSelect (opt) {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'MOVE_NEUTRAL_FIGURE',
          payload: {
            to: opt,
            figureId: this.actionItem.figureId
          }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.text
  font-size: 20px
  font-weight: 300

svg
  width: 74px
  height: 74px

  @media (max-height: 768px)
    width: 54px
    height: 54px
</style>
