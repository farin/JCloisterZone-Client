<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/118617/carcassonne-gold-mines" />
      <RulesLink :title="$t('buttons.rules')" href="http://wikicarpedia.com/index.php/The_Goldmines" />
      <RulesLink :title="$t('buttons.rules-1st-edition')" href="http://wikicarpedia.com/index.php/The_Goldmines_(1st_edition)" />
    </p>

    <TileDistribution :sets="{'goldmines': 1}" />
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
