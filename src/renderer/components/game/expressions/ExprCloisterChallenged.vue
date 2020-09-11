<template>
  <ExprContent :expr="expr">
    <template #title>
      <template v-if="name == 'cloister.challenged'">Challenged monastery</template>
      <template v-else-if="name == 'shrine.challenged'">Challenged shrine</template>
    </template>
    <template #row><slot /></template>
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
