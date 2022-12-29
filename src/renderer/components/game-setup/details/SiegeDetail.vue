<template>
  <div>
    <p>
      <RulesLink :title="$t('tile-sets.cathars-title')" href="https://boardgamegeek.com/boardgameexpansion/13300/carcassonne-die-katharer" />
      <RulesLink :title="$t('tile-sets.besiegers-title')" href="https://boardgamegeek.com/boardgameexpansion/166518/carcassonne-die-belagerer" />
      <RulesLink :title="$t('buttons.rules')" href="http://wikicarpedia.com/index.php/Besiegers_Cathars_Siege_(1st_edition)" />
    </p>

    <h5>{{ $t('tile-sets.cathars-title') }}</h5>

    <TileDistribution :sets="{'siege/cathars': 1}" />

    <h5>{{ $t('tile-sets.besiegers-title') }}</h5>

    <TileDistribution :sets="{'siege/besiegers': 1}" />
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
