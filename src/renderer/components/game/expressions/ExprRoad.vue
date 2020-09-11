<template>
  <ExprContent :expr="expr">
    <template #title>
      <template v-if="name == 'road' && !expr.args.inn">Road</template>
      <template v-if="name == 'road' && expr.args.inn">Road with inn</template>
      <template v-else-if="name == 'road.incomplete'">Incomplete road</template>
    </template>
    <template #row>
      <template v-if="expr.args.inn">
        2&ensp;×&ensp;
      </template>
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
