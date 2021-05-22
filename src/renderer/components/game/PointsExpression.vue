<template>
  <section>
    <div class="expr-title">
      {{ title }}
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
      <div class="equal">=</div>
      <div
        :class="'points ' + colorCssClass(expr.player)"
      >
        {{ expr.points }}
      </div>
    </div>
  </section>
  <!--component :is="component" :expr="expr">
    <template v-if="names.includes('mage')">
      +<div class="value-units nobg">{{ expr.args.tiles }}
        <NeutralFigure figure="mage" :width="28" :height="28" />
      </div>&ensp;
    </template>
    <template v-if="names.includes('witch')">
      /<div class="value-units nobg">2
        <NeutralFigure figure="witch" :width="28" :height="28" />
      </div>&ensp;
    </template>
    <template v-if="names.includes('cloister.church')">
      +<div class="value-units nobg">3
        <ExpansionSymbol :expansion="Expansion.DARMSTADT" :style="{ width: 28, height: 28 }" />
      </div>&ensp;
    </template>
    <template v-if="names.includes('little-buildings.default')">
      +&ensp;<div class="value-units">
        {{ expr.args.buildings }}
        <v-icon title="Tiles">fas fa-home</v-icon>
      </div>&ensp;
    </template>
    <template v-if="names.includes('little-buildings.321')">
      +&ensp;<div class="value-units">
        {{ expr.args.sheds + 2 * expr.args.houses + 3 * expr.args.towers }}
        <v-icon title="Tiles">fas fa-home</v-icon>
      </div>&ensp;
    </template>
    <template v-if="names.includes('fairy.completed')"><template v-if="names.length > 1">+</template>
      <div class="value-units nobg">3
        <NeutralFigure figure="fairy" :width="28" :height="28" />
      </div><template v-if="names.length == 1">=&ensp;</template></template>
    <template v-if="expr.name === 'king+robber'">+&ensp;
      <TokenImage token="ROBBER" :height="55" />&ensp;
    </template>
  </component-->
</template>

<script>
import { mapGetters } from 'vuex'

import { Expansion } from '@/models/expansions'
import ExpressionItem from '@/components/game/ExpressionItem'

const NAME_MAPPING = {
  'city': 'City',
  'city.tiny': 'Tiny city',
  'city.incomplete': 'Incomplete city',
  'road': 'Road',
  'road.incomplete': 'Incomplete road',
  'cloister': 'Monastery',
  'cloister.incomplete': 'Incomplete monastery',
  'cloister.challenged': 'Challenged monastery',
  'cloister.church': 'Church bonus',
  'shrine': 'Shrine',
  'shrine.incomplete': 'Incomplete shrine',
  'shrine.challenged': 'Challenged shrine',
  'garden': 'Garden',
  'garden.incomplete': 'Incomplete garden',
  'castle': 'Castle',
  'castle.incomplete': 'Incomplete castle',
  'fairy.turn': 'Fairy',
  'fairy.completed': 'Fairy',
  'flock': 'Flock',
  'wind-rose': 'Wind rose',
  'yaga-hut': 'Yaga hut',
  'yaga-hut.incomplete': 'Incomplete yaga hut',
  'farm': 'Field',
  'trade-goods': 'Trade Goods',
  'king': 'King',
  'robber': 'Robber',
  'monastery': 'Special monastery',
  'gold': 'Gold ingots',
  'vodyanoy': 'Vodyanoy'
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
      return NAME_MAPPING[this.expr.name] || this.expr.name
    }

    // names () {
    //   return this.expr.name.split('+')
    // }
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

    // .expr-item:nth-child(even)
    //   background: #e0e0e0

    // ::v-deep .value-units
    //   position: relative
    //   display: flex
    //   flex-direction: column
    //   align-items: center
    //   text-align: center
    //   padding: 0 10px
    //   margin: 0 2px

    //   +theme using ($theme)
    //     background: map-get($theme, 'expr-units-bg')
    //     color: map-get($theme, 'expr-units-text')

    //   i
    //     margin-top: 5px

    //     +theme using ($theme)
    //       color: map-get($theme, 'gray-text-color')

    //   img
    //     position: absolute
    //     height: 32px
    //     top: 45px

    // .value-units.nobg
    //   background: none

.expr-title
  position: absolute
  left: 0
  max-width: 210px
  height: var(--action-bar-height)
  line-height: 1
  display: flex
  align-items: center
  padding-left: 20px
  font-size: 20px
  font-weight: 300
</style>
