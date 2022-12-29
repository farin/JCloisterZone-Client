<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/177728/carcassonne-hero-crossroads-baba-yaga" />
      <RulesLink :title="$t('button.rules')" href="http://wikicarpedia.com/index.php/Russian_Promos_(1st_edition)" />
    </p>

    <h5>{{ $t('tile-sets.russian-promos-2013-title') }}</h5>
    <TileDistribution :sets="{'russian-promos/2013': 1}" />

    <h5>{{ $t('tile-sets.russian-promos-2016-title') }}</h5>
    <TileDistribution :sets="{'russian-promos/2016': 1}" />
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
