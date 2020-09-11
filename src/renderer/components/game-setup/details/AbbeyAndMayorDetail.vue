<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/31784/carcassonne-expansion-5-abbey-mayor" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Abbey_and_the_Mayor" />
      <RulesLink title="Rules (1st ed.)" href="http://wikicarpedia.com/index.php/Abbey_and_the_Mayor_(1st_edition)" />
    </p>

    <p>
      The fifth major expansion released in 2007.
    </p>

    <TileDistribution :sets="{'abbey-and-mayor': 1}" />

    <p>
      Each a player can also place Abbey tile from his supply.
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
