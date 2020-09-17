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
import ExprMixin from '@/components/game/expressions/ExprMixin'

export default {
  components: {
    ExprContent
  },

  mixins: [ExprMixin],

  props: {
    expr: { type: Object, required: true }
  }
}
</script>
