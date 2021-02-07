<template>
  <ExprContent :expr="expr">
    <template #title>Sheep</template>
    <template #row>
      <TokenImage
        v-for="i in expr.args.SHEEP_1X"
        :key="`1x-${i}`"
        token="SHEEP_1X"
        :height="46"
      />
      <TokenImage
        v-for="i in expr.args.SHEEP_2X"
        :key="`2x-${i}`"
        token="SHEEP_2X"
        :height="46"
      />
      <TokenImage
        v-for="i in expr.args.SHEEP_3X"
        :key="`3x-${i}`"
        token="SHEEP_3X"
        :height="46"
      />
      <TokenImage
        v-for="i in expr.args.SHEEP_4X"
        :key="`4x-${i}`"
        token="SHEEP_4X"
        :height="46"
      />
      &ensp;<slot />=&ensp;
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
  }
}
</script>
