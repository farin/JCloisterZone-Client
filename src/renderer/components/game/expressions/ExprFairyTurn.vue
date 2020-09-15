<template>
  <ExprContent :expr="expr">
    <template #title>Fairy: turn bonus</template>
    <template #row>
      <NeutralFigure figure="fairy" :width="45" :height="45" />
      &ensp;=&ensp;
    </template>
  </ExprContent>
</template>

<script>
import ExprContent from '@/components/game/expressions/ExprContent'
import NeutralFigure from '@/components/game/NeutralFigure'

export default {
  components: {
    ExprContent,
    NeutralFigure
  },

  props: {
    expr: { type: Object, required: true }
  }
}
</script>
