<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/66646/carcassonne-expansion-8-bridges-castles-and-bazaar" />
      <RulesLink :title="$t('buttons.rules')" href="http://wikicarpedia.com/index.php/Bridges,_Castles_and_Bazaars" />
      <RulesLink :title="$t('buttons.rules-1st-edition')" href="http://wikicarpedia.com/index.php/Bridges,_Castles_and_Bazaars_(1st_edition)" />
    </p>

    <p>
      {{ $t('tile-sets.bridges-castles-and-bazaars-release') }}
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
