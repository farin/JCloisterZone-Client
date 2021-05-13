<template>
  <div class="farm-points">
    <template v-if="expr.args.pigs || expr.args.pigHerds">(&ensp;</template>
    <slot />
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
  </div>
</template>

<script>
import { Expansion } from '@/models/expansions'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  props: {
    expr: { type: Object, required: true }
  },

  data () {
    return {
      MEEPLES_SVG,
      Expansion
    }
  }
}
</script>

<style lang="sass" scoped>
.farm-points
  display: flex

.exp-symbol
  margin-top: 6px
</style>
