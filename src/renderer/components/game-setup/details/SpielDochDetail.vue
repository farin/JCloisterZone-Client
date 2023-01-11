<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/260589/carcassonne-spiel-doch-mini-expansion" />
      <RulesLink :title="$t('button.rules')" href="http://wikicarpedia.com/index.php/Special:MyLanguage/Spiel_Doch_Promo" />
    </p>

    <TileDistribution :sets="{'spiel-doch': 1}" />
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
