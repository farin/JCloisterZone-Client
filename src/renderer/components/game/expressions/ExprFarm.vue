<template>
  <ExprContent :expr="expr">
    <template #title>{{ title }}</template>
    <template #row>
      {{ basePoints }}&ensp;×&ensp;
      <div class="value-units">
        {{ expr.args.cities || 0 }}
        <img src="~/assets/icons/city-icon.png" height="32">
      </div>&ensp;
      <template v-if="expr.args.pigs">
        +&ensp;
        <div class="value-units">
          {{ expr.args.pigs }}
          <ExpansionSymbol :expansion="Expansion.TRADERS_AND_BUILDERS" :style="{ width: 24, height: 24 }" />
        </div>&ensp;×&ensp;
        <div class="value-units">
          {{ expr.args.cities || 0 }}
          <img src="~/assets/icons/city-icon.png" height="32">
        </div>&ensp;
      </template>
      <template v-if="expr.args.pigHerds">
        +&ensp;
        <div class="value-units">
          {{ expr.args.pigHerds }}
          <img src="~/assets/features/C1/pig_herd.jpg" height="32" />
        </div>&ensp;×&ensp;
        <div class="value-units">
          {{ expr.args.cities || 0 }}
          <img src="~/assets/icons/city-icon.png" height="32">
        </div>&ensp;
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
