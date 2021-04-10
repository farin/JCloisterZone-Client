<template>
  <ExprContent :expr="expr">
    <template #title>{{ title }}</template>
    <template #row>
      <template v-if="expr.args.pigs || expr.args.pigHerds">(&ensp;</template>
      {{ basePoints }}
      <template v-if="expr.args.pigs">
        &ensp;+&ensp;
        <div class="value-units nobg">{{ expr.args.pigs }}
          <svg class="meeple mt-2" :width="24" :height="24">
            <use :href="`${MEEPLES_SVG}#pig`" />
          </svg>
        </div>
      </template>
      <template v-if="expr.args.pigHerds">
        &ensp;+&ensp;
        <div class="value-units nobg">{{ expr.args.pigHerds }}
          <img src="~/assets/features/C1/pig_herd.jpg" height="24">
        </div>
      </template>
      <template v-if="expr.args.pigs || expr.args.pigHerds">&ensp;)</template>
      &ensp;×&ensp;
      <template v-if="expr.args.coc">(&ensp;</template>
      <div class="value-units">
        {{ expr.args.cities || 0 }}
        <img src="~/assets/icons/city-icon.png" height="32">
      </div>
      <template v-if="expr.args.coc">
      	&ensp;+&ensp;
        <div class="value-units">
          {{ expr.args.coc || 0 }}
          <ExpansionSymbol :expansion="Expansion.COUNT" :style="{ width: 24, height: 24 }" />
        </div>
        &ensp;)
      </template>
      <template v-if="expr.args.besieged">
        +&ensp;{{ basePoints * 2 }}&ensp;×&ensp;
        <div class="value-units">
          {{ expr.args.besieged }}
          <ExpansionSymbol :expansion="Expansion.SIEGE" :style="{ width: 24, height: 24 }" />
        </div>&ensp;
      </template>
      <template v-if="expr.args.castles">
        +&ensp;{{ basePoints + 1}}&ensp;×&ensp;
        <div class="value-units">
          {{ expr.args.castles }}
          <TokenImage token="CASTLE" :height="32" />
        </div>&ensp;
      </template>
      <slot />=&ensp;
    </template>
  </ExprContent>
</template>

<script>
import { Expansion } from '@/models/expansions'
import ExpansionSymbol from '@/components/ExpansionSymbol'
import ExprContent from '@/components/game/expressions/ExprContent'
import ExprMixin from '@/components/game/expressions/ExprMixin'
import TokenImage from '@/components/game/TokenImage'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  components: {
    ExpansionSymbol,
    ExprContent,
    TokenImage
  },

  mixins: [ExprMixin],

  props: {
    expr: { type: Object, required: true }
  },

  data () {
    return {
      MEEPLES_SVG,
      Expansion
    }
  },

  computed: {
    title () {
      if (this.name === 'farm.barn-connected') return 'Barn connected'
      if (this.name === 'farm.barn') return 'Barn'
      return 'Field'
    },

    basePoints () {
      if (this.name === 'farm.barn') return 4
      if (this.name === 'farm.barn-connected') return 1
      return 3
    }
  }
}
</script>

<style lang="sass" scoped>
.exp-symbol
  margin-top: 6px
</style>
