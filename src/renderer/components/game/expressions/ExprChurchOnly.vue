<template>
  <ExprContent :expr="expr">
    <template #title>Church bonus</template>
    <template #row>
      <ExpansionSymbol :expansion="Expansion.DARMSTADT" :size="55" />
      &nbsp;=&nbsp;
    </template>
  </ExprContent>
</template>

<script>
import { Expansion } from '@/models/expansions'
import ExpansionSymbol from '@/components/ExpansionSymbol'
import ExprContent from '@/components/game/expressions/ExprContent'

export default {
  components: {
    ExprContent,
    ExpansionSymbol
  },

  props: {
    expr: { type: Object, required: true }
  },

  data () {
    return { Expansion }
  }
}
</script>
