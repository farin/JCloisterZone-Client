<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/168121/carcassonne-darmstadt" />
      <RulesLink :title="$t('buttons.rules')" href="http://wikicarpedia.com/index.php/Darmstadt_Promo_(1st_edition)" />
    </p>

    <p>
      {{ $t('tile-sets.darmstadt-release') }}
    </p>

    <TileDistribution :sets="{'darmstadt': 1}" />
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
