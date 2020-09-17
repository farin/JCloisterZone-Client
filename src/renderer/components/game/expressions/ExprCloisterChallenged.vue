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
