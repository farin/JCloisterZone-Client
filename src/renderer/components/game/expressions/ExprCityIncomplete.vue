<template>
  <ExprContent :expr="expr">
    <template #title>Incomplete city</template>
    <template #row>
      <div class="value-units">
        {{ expr.args.tiles }}
        <v-icon title="Tiles">far fa-square</v-icon>
      </div>
      +
      <div class="value-units">
        {{ expr.args.pennants }}
        <v-icon title="Coats of arms">fas fa-shield-alt</v-icon>
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
