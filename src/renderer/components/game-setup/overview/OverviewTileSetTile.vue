<template>
  <OverviewTile enabled>
    <ExpansionSymbol :expansion="expansion" />

    <template #title>{{ set.title }}</template>
    <template #quantity>{{ quantity > 1 ? quantity : '' }}</template>
  </OverviewTile>
</template>

<script>
import ExpansionSymbol from '@/components/ExpansionSymbol'
import OverviewTile from '@/components/game-setup/overview/OverviewTile'

export default {
  components: {
    ExpansionSymbol,
    OverviewTile
  },

  props: {
    expansion: { type: Object, required: true },
    set: { type: Object, required: true },
    quantity: { type: Number, default: 1 }
  }
}
</script>

<style lang="sass" scoped>
.exp-symbol
  width: 70px
  height: 70px
</style>
