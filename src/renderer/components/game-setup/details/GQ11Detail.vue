<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/26615/carcassonne-promo-tiles" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Games_Quarterly_11_(1st_edition)" />
    </p>

    <p>
      Originally released in Games Quarterly magazine in 2006.
    </p>

    <TileDistribution :sets="{'gq11': 1, 'gq11/river': 1}" />
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
