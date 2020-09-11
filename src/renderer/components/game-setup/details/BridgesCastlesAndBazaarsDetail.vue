<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/66646/carcassonne-expansion-8-bridges-castles-and-bazaar" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Bridges,_Castles_and_Bazaars" />
      <RulesLink title="Rules (1st ed.)" href="http://wikicarpedia.com/index.php/Bridges,_Castles_and_Bazaars_(1st_edition)" />
    </p>

    <p>
      The eight major expansion released in 2010.
      (Sixth major expansion Count, King and Robber is splitted into
      individual small modules. Seventh, The Catapult, is obvously skipped)
    </p>

    <TileDistribution :sets="{'bridges-castles-and-bazaars': 1}" />
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
