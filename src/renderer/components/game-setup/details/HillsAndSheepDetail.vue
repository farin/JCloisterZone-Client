<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/153773/carcassonne-expansion-9-hills-sheep" />
      <RulesLink :title="$t('buttons.rules')" href="http://wikicarpedia.com/index.php/Hills_%26_Sheep" />
      <RulesLink :title="$t('buttons.rules-1st-edition')" href="http://wikicarpedia.com/index.php/Hills_%26_Sheep_(1st_edition)" />
    </p>

    <p>
      {{ $t('tile-sets.hills-and-sheep-release') }}
    </p>

    <TileDistribution :sets="{'hills-and-sheep': 1}" />
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
