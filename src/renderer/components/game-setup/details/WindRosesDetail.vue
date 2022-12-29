<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/131676/carcassonne-die-windrosen" />
      <RulesLink :title="$t('button.rules')" href="http://wikicarpedia.com/index.php/Wind_Roses_(1st_edition)" />
    </p>

    <TileDistribution :sets="{'wind-roses': 1}" />
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
