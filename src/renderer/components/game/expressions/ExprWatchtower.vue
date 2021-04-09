<template>
  <ExprContent :expr="expr">
    <template #title>
      Watchtower Bonus
    </template>
    <template #row>
      <template v-if="expr.args.pennant">
        2
        &ensp;×&ensp;
        <div class="value-units">
          {{ expr.args.pennant }}
          <v-icon title="Coats of arms">fas fa-shield-alt</v-icon>
        </div>
      </template>
      <template v-else-if="expr.args.meeple">
        2
        &ensp;×&ensp;
        <div class="value-units">
          {{ expr.args.meeple }}
          <svg class="meeple" :width="24" :height="24">
            <use :href="`${MEEPLES_SVG}#small-follower`" />
          </svg>
        </div>
      </template>
      <template v-else-if="expr.args.monastery">
        3
        &ensp;×&ensp;
        <div class="value-units">
          {{ expr.args.monastery }}
          <img src="~/assets/features/C1/cloister.png" height="24">
        </div>
      </template>
      <template v-else-if="expr.args.road">
        1
        &ensp;×&ensp;
        <div class="value-units">
          {{ expr.args.road }}
        <img src="~/assets/icons/road-icon.png" height="32">
        </div>
      </template>
      <template v-else-if="expr.args.city">
        1
        &ensp;×&ensp;
        <div class="value-units">
          {{ expr.args.city }}
          <img src="~/assets/icons/city-icon.png" height="32">
        </div>
      </template>
      <slot />=&ensp;
    </template>
  </ExprContent>
</template>

<script>
import { Expansion } from '@/models/expansions'
import ExpansionSymbol from '@/components/ExpansionSymbol'
import ExprContent from '@/components/game/expressions/ExprContent'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  components: {
    ExpansionSymbol,
    ExprContent
  },

  props: {
    expr: { type: Object, required: true }
  },

  data () {
    return {
      Expansion,
      MEEPLES_SVG
    }
  }
}
</script>
