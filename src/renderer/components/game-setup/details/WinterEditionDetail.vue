<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/131014/carcassonne-winter-edition" />
    </p>

    <p>
      Basic set from Winter Edition spin-off. Contains basic game extended with additional 12 tiles.
    </p>

    <TileDistribution :sets="{winter: 1}" />
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
