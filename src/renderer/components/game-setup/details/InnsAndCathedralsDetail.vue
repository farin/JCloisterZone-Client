<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/2993/carcassonne-expansion-1-inns-cathedrals" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Inns_and_Cathedrals" />
      <RulesLink title="Rules (1st ed.)" href="http://wikicarpedia.com/index.php/Inns_and_Cathedrals_(1st_edition)" />
    </p>

    <p>
      First major expansion for Carcassonne released in 2002.
    </p>

    <TileDistribution :sets="{'inns-and-cathedrals': 1}" />
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
