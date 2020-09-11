<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/123905/carcassonne-festival" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/The_Festival" />
      <RulesLink title="Rules (1st ed.)" href="http://wikicarpedia.com/index.php/The_Festival_(1st_edition)" />
    </p>

    <TileDistribution :sets="{'festival': 1}" />
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
