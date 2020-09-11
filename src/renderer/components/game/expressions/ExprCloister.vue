<template>
  <ExprContent :expr="expr">
    <template #title>
      <template v-if="name == 'cloister'">Monastery</template>
      <template v-else-if="name == 'cloister.incomplete'">Incomplete monastery</template>
      <template v-else-if="name == 'shrine'">Shrine</template>
      <template v-else-if="name == 'shrine.incomplete'">Incomplete Shrine</template>
    </template>
    <template #row>
      <div class="value-units">
        {{ expr.args.tiles }}
        <v-icon title="Tiles">far fa-square</v-icon>
      </div>
      <template v-if="expr.args.vineyards">
        &ensp;+&ensp;(&ensp;3&ensp;×&ensp;<div class="value-units">
          {{ expr.args.vineyards }}
          <img src="~/assets/features/C1/vineyard.png">
        </div>
        &ensp;)
      </template>
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
