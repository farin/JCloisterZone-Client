<template>
  <section>
    <div class="move-dragon-item">
      <NeutralFigure figure="dragon" :width="90" :height="45" />
      <v-icon
        v-for="i in dragon.remaining"
        :key="i"
      >
        fas fa-arrow-right
      </v-icon>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex'

import NeutralFigure from '@/components/game/NeutralFigure'

export default {
  components: {
    NeutralFigure
  },

  props: {
    action: { type: Object, required: true }
  },

  computed: {
    ...mapState({
      dragon: state => state.game.neutralFigures.dragon
    }),

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
    this.$root.$on('tile.select', this.onSelect)
    this.showLayer()
  },

  beforeDestroy () {
    this.$root.$off('tile.select', this.onSelect)
    this.hideLayer()
  },

  methods: {
    showLayer () {
      this.$store.dispatch('board/showLayer', {
        layer: 'DragonMoveLayer',
        props: {
          options: this.actionItem.options
        }
      })
    },

    hideLayer () {
      this.$store.dispatch('board/hideLayer', { layer: 'DragonMoveLayer' })
    },

    async onSelect (position) {
      await this.$store.dispatch('game/apply', {
        type: 'MOVE_NEUTRAL_FIGURE',
        payload: {
          figureId: this.actionItem.figureId,
          to: position
        }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.move-dragon-item
  display: flex
  align-items: center

  i
    margin-right: 10px

.v-icon
  font-size: 30px

svg.dragon
  margin: 0 20px
</style>
