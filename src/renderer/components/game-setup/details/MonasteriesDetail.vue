<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/158041/carcassonne-kloster-deutschland" />
      <RulesLink :title="$t('button.rules')" href="http://wikicarpedia.com/index.php/Monasteries" />
      <RulesLink :title="$t('button.rules-1st-edition')" href="http://wikicarpedia.com/index.php/Monasteries_(1st_edition)" />
    </p>

    <TileDistribution :sets="{'monasteries': 1}" />
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
