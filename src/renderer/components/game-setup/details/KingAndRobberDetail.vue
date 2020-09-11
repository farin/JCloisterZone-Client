<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/33458/carcassonne-expansion-6-count-king-robber" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Count,_King_and_Robber#King_and_robber" />
      <RulesLink title="Rules (1st ed.)" href="http://wikicarpedia.com/index.php/Count,_King_and_Robber_(1st_edition)#King_and_Robber_Baron" />
    </p>

    <p>
      Originally released in 2003 as part of King & Scout. Later included in the sixth major expansion: Count, King & Robber (2007)
    </p>

    <TileDistribution :sets="{'king-and-robber': 1}" />
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
