<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/38431/carcassonne-cult" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Count,_King_and_Robber#The_cultists" />
    </p>

    <h5>Cult Places</h5>
    <TileDistribution :sets="{'cult/6': 1}" />

    <h5>Heretics and Shrines</h5>
    <TileDistribution :sets="{'cult/5': 1}" />
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
