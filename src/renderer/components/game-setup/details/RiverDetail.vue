<template>
  <div>
    <p>
      <RulesLink :title="$t('tile-sets.river-I-title')" href="https://boardgamegeek.com/boardgame/2591/carcassonne-river" />
      <RulesLink :title="$t('tile-sets.river-II-title')" href="https://boardgamegeek.com/boardgame/18836/carcassonne-river-ii" />
      <RulesLink :title="$t('buttons.rules')" href="http://wikicarpedia.com/index.php/River" />
      <RulesLink :title="$t('buttons.rules-1st-edition')" href="http://wikicarpedia.com/index.php/River_(1st_edition)" />
    </p>

    <p>
      {{ $t('tile-sets.river-I-release') }}
    </p>

    <TileDistribution :sets="{'river/1': 1}" />

    <p>
      {{ $t('tile-sets.river-II-release') }}
    </p>

    <TileDistribution :sets="{'river/2': 1}" />
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
