<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/31784/carcassonne-expansion-5-abbey-mayor" />
      <RulesLink :title="$t('button.rules')" href="http://wikicarpedia.com/index.php/Abbey_and_the_Mayor" />
      <RulesLink :title="$t('button.rules-1st-edition')" href="http://wikicarpedia.com/index.php/Abbey_and_the_Mayor_(1st_edition)" />
    </p>

    <p>
      {{ $t('tile-sets.abbey-mayor-release') }}
    </p>

    <TileDistribution :sets="{'abbey-and-mayor': 1}" />

    <p>
      {{ $t('tile-sets.abbey-mayor-description') }}
    </p>

    <StandaloneTileImage tile-id="AM/A" :size="100" />
  </div>
</template>

<script>
import RulesLink from '@/components/RulesLink'
import TileDistribution from '@/components/TileDistribution'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

export default {
  components: {
    RulesLink,
    TileDistribution,
    StandaloneTileImage
  }
}
</script>

<style lang="sass" scoped>
</style>
