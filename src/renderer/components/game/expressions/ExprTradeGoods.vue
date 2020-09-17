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
import ExprMixin from '@/components/game/expressions/ExprMixin'
import TokenImage from '@/components/game/TokenImage'

export default {
  components: {
    ExprContent,
    TokenImage
  },

  mixins: [ExprMixin],

  props: {
    expr: { type: Object, required: true }
  }
}
</script>
