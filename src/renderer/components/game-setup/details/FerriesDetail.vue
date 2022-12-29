<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/118614/carcassonne-ferries" />
      <RulesLink :title="$t('button.rules')" href="http://wikicarpedia.com/index.php/The_Ferries" />
      <RulesLink :title="$t('button.rules-1st-edition')" href="http://wikicarpedia.com/index.php/The_Ferries_(1st_edition)" />
    </p>

    <TileDistribution :sets="{'ferries': 1}" />
  </div>
</template>

<script>
import RulesLink from '@/components/RulesLink'
import TileDistribution from '@/components/TileDistribution'

export default {
  components: {
    RulesLink,
    TileDistribution
  }
}
</script>

<style lang="sass" scoped>
</style>
