<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/822/carcassonne" />
      <RulesLink :title="$t('button.rules')" href="http://wikicarpedia.com/index.php/Base_game#Base_game" />
      <RulesLink :title="$t('button.rules-1st-edition')" href="http://wikicarpedia.com/index.php/Base_game_(1st_edition)#Base_game" />
    </p>

    <p>
      {{ $t('tile-set.base-game-description') }}
    </p>

    <TileDistribution :sets="{basic: 1}" />
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
