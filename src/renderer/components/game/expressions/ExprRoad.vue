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
      &ensp;
      <template v-if="expr.args.meeples">
          +&ensp;2&ensp;×&ensp;
          <div class="value-units">
            {{ expr.args.meeples }}
            <svg class="meeple" :width="24" :height="24">
              <use :href="`${MEEPLES_SVG}#small-follower`" />
            </svg>
          </div>
          &ensp;
      </template>      
      <slot />=&ensp;
    </template>
  </ExprContent>
</template>

<script>
import ExprContent from '@/components/game/expressions/ExprContent'
import ExprMixin from '@/components/game/expressions/ExprMixin'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  components: {
    ExprContent
  },

  mixins: [ExprMixin],

  data () {
    return { MEEPLES_SVG }
  },

  props: {
    expr: { type: Object, required: true }
  }
}
</script>
