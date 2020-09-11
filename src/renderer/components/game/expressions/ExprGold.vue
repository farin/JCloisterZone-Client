<template>
  <ExprContent :expr="expr">
    <template #title>Gold ingots</template>
    <template #row>
      {{ expr.args.pieces }}&ensp;<img src="~/assets/figures/gold.png" height="30">
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
