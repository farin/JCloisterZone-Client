<template>
  <ExprContent :expr="expr">
    <template #title>
      <template v-if="expr.name === 'castle'">Castle</template>
      <template v-else-if="expr.name === 'castle.incomplete'">Incomplete castle</template>
    </template>
    <template #row>
      {{ expr.args.pieces }}&ensp;<img src="~/assets/figures/castle.png" height="70">
      &ensp;=&ensp;
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
