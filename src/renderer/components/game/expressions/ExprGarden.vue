<template>
  <ExprContent :expr="expr">
    <template #title>
      <template v-if="name == 'garden'">Completed garden</template>
      <template v-else-if="name == 'garden.incomplete'">Incomplete garden</template>
    </template>
    <template #row>
      <div class="value-units">
        {{ expr.args.tiles }}
        <v-icon title="Tiles">far fa-square</v-icon>
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
  },

  computed: {
    name () {
      return this.expr.name.split('+')[0]
    }
  }
}
</script>
