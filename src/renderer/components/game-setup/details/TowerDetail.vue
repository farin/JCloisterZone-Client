<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/21385/carcassonne-expansion-4-tower" />
      <RulesLink :title="$t('button.rules')" href="http://wikicarpedia.com/index.php/The_Tower" />
      <RulesLink :title="$t('button.rules-1st-edition')" href="http://wikicarpedia.com/index.php/The_Tower_(1st_edition)" />
    </p>

    <p>
      {{ $t('tile-sets.tower-release') }}
    </p>

    <TileDistribution :sets="{'tower': 1}" />
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
