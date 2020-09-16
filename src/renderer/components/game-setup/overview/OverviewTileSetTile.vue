<template>
  <OverviewTile enabled :quantity="quantity">
    <ExpansionSymbol :expansion="expansion" :size="70" />

    <template #title>{{ set.title }}</template>
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
  },
}
</script>
