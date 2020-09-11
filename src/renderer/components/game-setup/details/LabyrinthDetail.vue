<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/195771/carcassonne-das-labyrinth" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/The_Labyrinths" />
    </p>

    <p>
      Originally released in 2016.
    </p>

    <TileDistribution :sets="{'labyrinth': 1}" />
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
