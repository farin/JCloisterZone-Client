<template>
  <div>
    <p>
      <RulesLink title="River I" href="https://boardgamegeek.com/boardgame/2591/carcassonne-river" />
      <RulesLink title="River II" href="https://boardgamegeek.com/boardgame/18836/carcassonne-river-ii" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/River" />
      <RulesLink title="Rules (1st ed.)" href="http://wikicarpedia.com/index.php/River_(1st_edition)" />
    </p>

    <p>
      The River I is mini expansion released in 2001.
    </p>

    <TileDistribution :sets="{'river/1': 1}" />

    <p>
      The River II was released in 2006 and now is contained in sixth major expansion Count, King & Robber.
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
