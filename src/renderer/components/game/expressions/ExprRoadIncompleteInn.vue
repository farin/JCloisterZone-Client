<template>
  <ExprContent :expr="expr">
    <template #title>Incomplete road with inn</template>
    <template #row>
      <div v-if="expr.name.includes('+')">0&nbsp;</div>
      <slot /><span v-if="expr.name.includes('+')">=&ensp;</span>
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
