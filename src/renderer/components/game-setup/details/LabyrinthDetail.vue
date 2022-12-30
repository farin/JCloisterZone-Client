<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/195771/carcassonne-das-labyrinth" />
      <RulesLink :title="$t('button.rules')" href="http://wikicarpedia.com/index.php/The_Labyrinths" />
    </p>

    <p>
      {{ $t('tile-set.labyrinth-release') }}
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
