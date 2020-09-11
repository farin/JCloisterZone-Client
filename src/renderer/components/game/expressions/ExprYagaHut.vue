<template>
  <ExprContent :expr="expr">
    <template #title>Yaga hut</template>
    <template #row>
      1&ensp;+&ensp;
      <div class="value-units">
        {{ expr.args.emptyTiles }}
        <v-icon title="Tiles">fas fa-square</v-icon>
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
