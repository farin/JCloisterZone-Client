<template>
  <div>
    <p>
      <RulesLink :title="$t('expansion.river-I')" href="https://boardgamegeek.com/boardgame/2591/carcassonne-river" />
      <RulesLink :title="$t('expansion.river-II')" href="https://boardgamegeek.com/boardgame/18836/carcassonne-river-ii" />
      <RulesLink :title="$t('button.rules')" href="http://wikicarpedia.com/index.php/Special:MyLanguage/River" />
      <RulesLink :title="$t('button.rules-1st-edition')" href="http://wikicarpedia.com/index.php/Special:MyLanguage/River_(1st_edition)" />
    </p>

    <p>
      {{ $t('expansion.river-I-release') }}
    </p>

    <TileDistribution :sets="{'river/1': 1}" />

    <p>
      {{ $t('expansion.river-II-release') }}
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
