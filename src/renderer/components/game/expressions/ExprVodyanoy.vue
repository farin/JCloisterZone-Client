<template>
  <ExprContent :expr="expr">
    <template #title>Vodyanoy</template>
    <template #row>
      -2&ensp;×&ensp;
      <div class="value-units">
        {{ expr.args.followers }}
        <Meeple type="SmallFollower" />
      </div>
      <slot />=&ensp;
    </template>
  </ExprContent>
</template>

<script>
import ExprContent from '@/components/game/expressions/ExprContent'
import Meeple from '@/components/game/Meeple'

export default {
  components: {
    ExprContent,
    Meeple
  },

  props: {
    expr: { type: Object, required: true }
  }
}
</script>

<style lang="sass" scoped>
svg
  width: 34px
</style>
