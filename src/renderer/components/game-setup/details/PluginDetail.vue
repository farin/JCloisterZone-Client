<template>
  <div>

    <p>
      <h3>This is unofficial plugin</h3>
    </p>

    <template v-for="set in expansion.sets">
      <TileDistribution :sets="{ [set.id] : 1}" />
    </template>

    <h4>Grayed out tiles are not supported by current version</h4>

  </div>
</template>

<script>
import RulesLink from '@/components/RulesLink'
import TileDistribution from '@/components/TileDistribution'

export default {
  components: {
    RulesLink,
    TileDistribution
  },

  props: {
    expansion: { type: Object, required: true }
  }
}
</script>

<style lang="sass" scoped>
</style>
