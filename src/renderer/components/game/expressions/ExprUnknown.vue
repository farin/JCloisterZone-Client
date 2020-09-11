<template>
  <ExprContent :expr="expr">
    <template #title>
      {{ expr.name }}
    </template>
    <template #row>
      {{ expr.args }}
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
