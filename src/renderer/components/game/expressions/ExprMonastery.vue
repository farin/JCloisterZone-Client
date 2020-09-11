<template>
  <ExprContent :expr="expr">
    <template #title>Special monastery</template>
    <template #row>
      1&ensp;+&ensp;
      <div class="value-units">
        {{ expr.args.N }}
        <v-icon>fas fa-arrow-up</v-icon>
      </div>
      &ensp;+&ensp;
      <div class="value-units">
        {{ expr.args.E }}
        <v-icon>fas fa-arrow-right</v-icon>
      </div>
      &ensp;+&ensp;
      <div class="value-units">
        {{ expr.args.S }}
        <v-icon>fas fa-arrow-down</v-icon>
      </div>
      &ensp;+&ensp;
      <div class="value-units">
        {{ expr.args.W }}
        <v-icon>fas fa-arrow-left</v-icon>
      </div>
      &ensp;<slot />=&ensp;
    </template>
  </ExprContent>
</template>

<script>
import ExprContent from '@/components/game/expressions/ExprContent'

export default {
  components: {
    ExprContent
  },

  props: {
    expr: { type: Object, required: true }
  }
}
</script>
