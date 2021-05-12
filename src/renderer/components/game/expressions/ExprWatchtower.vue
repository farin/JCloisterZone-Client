<template>
  <ExprContent :expr="expr">
    <template #title>
      Watchtower Bonus
    </template>
    <template #row>
      <template v-if="expr.args.bonusPennant>0 && expr.args.pennant>0">
        {{ expr.args.bonusPennant }}
        &ensp;×&ensp;
        <div class="value-units">
          {{ expr.args.pennant }}
          <v-icon title="Coats of arms">fas fa-shield-alt</v-icon>
        </div>
      </template>
      <template v-else-if="expr.args.bonusMeeple>0 && expr.args.meeple>0">
        {{ expr.args.bonusMeeple }}
        &ensp;×&ensp;
        <div class="value-units">
          {{ expr.args.meeple }}
          <svg class="meeple" :width="24" :height="24">
            <use :href="`${MEEPLES_SVG}#small-follower`" />
          </svg>
        </div>
      </template>
      <template v-else-if="expr.args.bonusMonastery>0 && expr.args.monastery>0">
        {{ expr.args.bonusMonastery }}
        &ensp;×&ensp;
        <div class="value-units">
          {{ expr.args.monastery }}
          <img src="~/assets/features/C1/cloister.png" height="24">
        </div>
      </template>
      <template v-else-if="expr.args.bonusRoad>0 && expr.args.road>0">
        {{ expr.args.bonusRoad }}
        &ensp;×&ensp;
        <div class="value-units">
          {{ expr.args.road }}
        <img src="~/assets/icons/road-icon.png" height="32">
        </div>
      </template>
      <template v-else-if="expr.args.bonusCity>0 && expr.args.city>0">
        {{ expr.args.bonusCity }}
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
