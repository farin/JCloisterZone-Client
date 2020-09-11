<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/5405/carcassonne-expansion-2-traders-builders" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Traders_and_Builders" />
      <RulesLink title="Rules (1st ed.)" href="http://wikicarpedia.com/index.php/Traders_and_Builders_(1st_edition)" />
    </p>

    <p>
      The second major expansion released in 2003
    </p>

    <TileDistribution :sets="{'traders-and-builders': 1}" />
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
