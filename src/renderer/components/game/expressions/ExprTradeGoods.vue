<template>
  <ExprContent :expr="expr">
    <template #title>Trade Goods</template>
    <template #row>
      <TokenImage :token="name.replace('trade-goods.', '')" :height="55" />
      &ensp;=&ensp;
    </template>
  </ExprContent>
</template>

<script>
import ExprContent from '@/components/game/expressions/ExprContent'
import TokenImage from '@/components/game/TokenImage'

export default {
  components: {
    ExprContent,
    TokenImage
  },

  props: {
    expr: { type: Object, required: true }
  },

  computed: {
    name () {
      return this.expr.name.split('+')[0]
    }
  }
}
</script>
