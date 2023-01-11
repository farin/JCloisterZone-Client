<template>
  <div>
    <p>
      <RulesLink :title="$t('tile-set.crop-circles-I')" href="https://boardgamegeek.com/boardgame/67055/carcassonne-die-kornkreise" />
      <RulesLink :title="$t('tile-set.crop-circles-II')" href="https://boardgamegeek.com/boardgame/120686/carcassonne-corn-circles-ii" />
      <RulesLink :title="$t('button.rules')" href="http://wikicarpedia.com/index.php/Special:MyLanguage/Crop_Circles" />
      <RulesLink :title="$t('button.rules-1st-edition')" href="http://wikicarpedia.com/index.php/Special:MyLanguage/Crop_Circles_(1st_edition)" />
    </p>

    <h5>{{ $t('tile-set.crop-circles-I-title') }}</h5>
    <TileDistribution :sets="{'corn-circles/1': 1}" />

    <h5>{{ $t('tile-set.crop-circles-II-title') }}</h5>
    <TileDistribution :sets="{'corn-circles/2': 1}" />
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
