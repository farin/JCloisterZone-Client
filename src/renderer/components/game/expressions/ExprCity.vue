<template>
  <ExprContent :expr="expr">
    <template #title>
      <template v-if="expr.args.cathedral &&expr.args.besieged">Besieged city with cathedral</template>
      <template v-else-if="expr.args.cathedral">City with cathedral</template>
      <template v-else-if="expr.args.besieged">Besieged city</template>
      <template v-else>City</template>
    </template>
    <template #row>
      <!-- <template v-if="expr.args.cathedral">( &ensp;2&ensp;+&ensp;1&ensp;)</template> -->
      <template v-if="expr.args.cathedral && !expr.args.besieged">3</template>
      <template v-else-if="expr.args.besieged && !expr.args.cathedral">1</template>
      <template v-else>2</template>
      &ensp;×&ensp;(
      <div class="value-units">
        {{ expr.args.tiles }}
        <v-icon title="Tiles">far fa-square</v-icon>
      </div>
      +
      <div class="value-units">
        {{ expr.args.pennants }}
        <v-icon title="Coats of arms">fas fa-shield-alt</v-icon>
      </div>
      )&ensp;
      <template v-if="expr.args.extraPoints">
        +<div class="value-units nobg">
          {{ expr.args.extraPoints }}
          <ExpansionSymbol :expansion="Expansion.DARMSTADT" :style="{ width: 28, height: 28 }" />
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

export default {
  components: {
    ExpansionSymbol,
    ExprContent
  },

  props: {
    expr: { type: Object, required: true }
  },

  data () {
    return { Expansion }
  }
}
</script>
