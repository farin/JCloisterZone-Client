<template>
  <component :is="component" :expr="expr">
    <!-- eslint-disable vue/multiline-html-element-content-newline -->
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
  </component>
</template>

<script>
import { mapGetters } from 'vuex'

import { Expansion } from '@/models/expansions'
import ExpansionSymbol from '@/components/ExpansionSymbol'
import ExprCastle from '@/components/game/expressions/ExprCastle'
import ExprChurchOnly from '@/components/game/expressions/ExprChurchOnly'
import ExprCity from '@/components/game/expressions/ExprCity'
import ExprCityEmpty from '@/components/game/expressions/ExprCityEmpty'
import ExprCityIncomplete from '@/components/game/expressions/ExprCityIncomplete'
import ExprCityIncompleteCathedral from '@/components/game/expressions/ExprCityIncompleteCathedral'
import ExprCityTiny from '@/components/game/expressions/ExprCityTiny'
import ExprCloister from '@/components/game/expressions/ExprCloister'
import ExprCloisterChallenged from '@/components/game/expressions/ExprCloisterChallenged'
import ExprFairyCompletedOnly from '@/components/game/expressions/ExprFairyCompletedOnly'
import ExprFairyTurn from '@/components/game/expressions/ExprFairyTurn'
import ExprFarm from '@/components/game/expressions/ExprFarm'
import ExprFlock from '@/components/game/expressions/ExprFlock'
import ExprGarden from '@/components/game/expressions/ExprGarden'
import ExprGold from '@/components/game/expressions/ExprGold'
import ExprKing from '@/components/game/expressions/ExprKing'
import ExprMonastery from '@/components/game/expressions/ExprMonastery'
import ExprRoad from '@/components/game/expressions/ExprRoad'
import ExprRoadIncompleteInn from '@/components/game/expressions/ExprRoadIncompleteInn'
import ExprRobber from '@/components/game/expressions/ExprRobber'
import ExprTradeGoods from '@/components/game/expressions/ExprTradeGoods'
import ExprUnknown from '@/components/game/expressions/ExprUnknown'
import ExprWindRose from '@/components/game/expressions/ExprWindRose'
import ExprYagaHut from '@/components/game/expressions/ExprYagaHut'
import NeutralFigure from '@/components/game/NeutralFigure'
import TokenImage from '@/components/game/TokenImage'

export default {
  components: {
    ExpansionSymbol,
    ExprCastle,
    ExprChurchOnly,
    ExprCity,
    ExprCityEmpty,
    ExprCityIncomplete,
    ExprCityIncompleteCathedral,
    ExprCityTiny,
    ExprCloister,
    ExprCloisterChallenged,
    ExprFairyCompletedOnly,
    ExprFairyTurn,
    ExprFarm,
    ExprFlock,
    ExprGarden,
    ExprGold,
    ExprMonastery,
    ExprKing,
    ExprRoad,
    ExprRoadIncompleteInn,
    ExprRobber,
    ExprTradeGoods,
    ExprUnknown,
    ExprWindRose,
    ExprYagaHut,
    NeutralFigure,
    TokenImage
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

    names () {
      return this.expr.name.split('+')
    },

    component () {
      const [type, subtype] = this.names[0].split('.')
      if (type === 'city') {
        if (!subtype) return 'ExprCity'
        if (subtype === 'tiny') return 'ExprCityTiny'
        if (subtype === 'incomplete') return 'ExprCityIncomplete'
        if (subtype === 'incomplete-cathedral') return 'ExprCityIncompleteCathedral'
        if (subtype === 'empty') return 'ExprCityEmpty'
      }
      if (type === 'road') {
        if (!subtype || subtype === 'incomplete') return 'ExprRoad'
        if (subtype === 'incomplete-inn') return 'ExprRoadIncompleteInn'
      }
      if (type === 'cloister' || type === 'shrine') {
        if (this.expr.name === 'cloister.church') {
          return 'ExprChurchOnly'
        } else {
          // points are not just cloister church bonus
          return subtype === 'challenged' ? 'ExprCloisterChallenged' : 'ExprCloister'
        }
      }
      if (type === 'garden') return 'ExprGarden'
      if (type === 'castle') return 'ExprCastle'

      if (type === 'fairy') {
        if (subtype === 'turn') return 'ExprFairyTurn'
        if (subtype === 'completed') return 'ExprFairyCompletedOnly'
      }
      if (type === 'flock') return 'ExprFlock'
      if (type === 'wind-rose') return 'ExprWindRose'
      if (type === 'yaga-hut') return 'ExprYagaHut'
      if (type === 'farm') return 'ExprFarm' // not only final

      // only final scoring
      if (type === 'trade-goods') return 'ExprTradeGoods'
      if (type === 'king') return 'ExprKing'
      if (type === 'robber') return 'ExprRobber'
      if (type === 'monastery') return 'ExprMonastery'
      if (type === 'gold') return 'ExprGold'

      return 'ExprUnknown'
    }
  }
}
</script>
