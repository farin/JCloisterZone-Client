<template>
  <div>
    <p>
      <RulesLink :title="$t('expansion.cathars')" href="https://boardgamegeek.com/boardgameexpansion/13300/carcassonne-die-katharer" />
      <RulesLink :title="$t('expansion.besiegers')" href="https://boardgamegeek.com/boardgameexpansion/166518/carcassonne-die-belagerer" />
      <RulesLink :title="$t('button.rules')" href="http://wikicarpedia.com/index.php/Special:MyLanguage/Besiegers_Cathars_Siege_(1st_edition)" />
    </p>

    <h5>{{ $t('expansion.cathars') }}</h5>

    <TileDistribution :sets="{'siege/cathars': 1}" />

    <h5>{{ $t('expansion.besiegers') }}</h5>

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
