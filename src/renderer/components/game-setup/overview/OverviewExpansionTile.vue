<template>
  <OverviewTile
    enabled
    :z-index="zIndex"
  >
    <ExpansionSymbol :expansion="expansion" />

    <template #title>{{ title }}</template>
    <template #quantity>
      <div v-if="quantity !== 1" class="quantity tile-set">
        {{ quantity === -1 ? '?' : quantity }}
      </div>
    </template>
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
    title: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    zIndex: { type: Number, default: 1 }
  }
}
</script>

<style lang="sass" scoped>
.exp-symbol
  width: 70px
  height: 70px
</style>
