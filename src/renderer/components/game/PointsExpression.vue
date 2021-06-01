<template>
  <section @click="onClick">
    <div class="expr-title">
      <div>{{ title }}</div>
      <div v-if="subtitle" class="sub">{{ subtitle }}</div>
    </div>
    <div class="expr-row">
      <div class="expr">
        <ExpressionItem
          v-for="(item, idx) in expr.items"
          :key="idx"
          :item="item"
          :index="idx"
        />
      </div>
      <div v-if="expr.items.length" class="equal">=</div>
      <div
        :class="'points ' + colorCssClass(expr.player)"
      >
        {{ expr.points }}
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

import { Expansion } from '@/models/expansions'
import ExpressionItem from '@/components/game/ExpressionItem'

const TITLE_MAPPING = {
  'city': 'City',
  'city.tiny': 'Tiny city',
  'road': 'Road',
  'monastery': 'Monastery',
  'church': 'Church bonus',
  'shrine': 'Shrine',
  'garden': 'Garden',
  'castle': 'Castle',
  'fairy': 'Fairy',
  'flock': 'Flock',
  'wind-rose': 'Wind rose',
  'yaga-hut': 'Yaga hut',
  'field': 'Field',
  'trade-goods': 'Trade Goods',
  'king': 'King',
  'robber': 'Robber',
  'king+robber': 'King & Robber',
  'special-monastery': 'Special monastery',
  'gold': 'Gold ingots',
  'vodyanoy': 'Vodyanoy'
}

const SUBTITLE_MAPPING = {
  'incomplete': '(incomplete)',
  'challenged': '(challenged)',
  'empty': '(empty)',
  'city.tiny': null,
  'fairy.completed': '(feature scored)',
  'fairy.turn': '(turn start)',
  'barn-placed': '(barn placed)',
  'barn-connected': '(barn connected)'
}

export default {
  components: {
    ExpressionItem
  },

  props: {
    expr: { type: Object, required: true }
  },

  data () {
    return {
      Expansion
    }
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass'
    }),

    title () {
      let title = TITLE_MAPPING[this.expr.name]
      if (title) return title
      title = TITLE_MAPPING[this.expr.name.split('.')[0]]
      if (title) return title
      return this.expr.name
    },

    subtitle () {
      const title = SUBTITLE_MAPPING[this.expr.name]
      if (title !== undefined) return title
      const key = this.expr.name.split('.')[1]
      if (!key) return null
      return SUBTITLE_MAPPING[key] !== undefined ? SUBTITLE_MAPPING[key] : key
    }
  },

  methods: {
    onClick () {
      this.$store.commit('board/pointsExpression', null)
    }
  }
}
</script>

<style lang="sass" scoped>
.expr-row
  display: flex
  align-items: stretch
  height: 100%

  justify-content: center

  .points, .equal
    text-align: center
    font-size: 28px
    font-weight: 500
    align-self: center

  .equal
    margin-right: 12px

    +theme using ($theme)
      color: map-get($theme, 'gray-text-color')

  .points
    width: 69px
    border-radius: 23px

  .expr
    display: flex
    align-items: stretch
    font-size: 28px
    font-weight: 500
    padding-top: 1px

    +theme using ($theme)
      color: map-get($theme, 'gray-text-color')

.expr-title
  position: absolute
  left: 0
  max-width: 210px
  height: var(--action-bar-height)
  line-height: 1
  display: flex
  flex-direction: column
  justify-content: center
  padding-left: 20px
  font-size: 20px
  font-weight: 300

  .sub
    font-size: 16px
    margin-top: 4px
</style>
