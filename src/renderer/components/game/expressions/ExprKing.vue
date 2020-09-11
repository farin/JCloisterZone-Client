<template>
  <ExprContent :expr="expr">
    <template #title>King</template>
    <template #row>
      <div
        v-if="rule === 'default' || rule === 'continuously'"
        class="value-units"
      >
        {{ expr.points }}
        <img src="~/assets/icons/city-icon.png" height="32">
      </div>
      <TokenImage
        v-else
        token="KING" :height="55"
      />
      &ensp;<slot />=&ensp;
    </template>
  </ExprContent>
</template>

<script>
import { mapState } from 'vuex'

import ExprContent from '@/components/game/expressions/ExprContent'
import TokenImage from '@/components/game/TokenImage'

export default {
  components: {
    ExprContent,
    TokenImage
  },

  props: {
    expr: { type: Object, required: true }
  },

  computed: mapState({
    rule: state => state.game.setup.rules['king-and-robber-scoring']
  })
}
</script>
