<template>
  <ExprContent :expr="expr">
    <template #title>Incomplete city with cathedral</template>
    <template #row><slot /></template>
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
