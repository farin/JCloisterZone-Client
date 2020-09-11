<template>
  <div>
    <p>
      <RulesLink title="The Cathars" href="https://boardgamegeek.com/boardgameexpansion/13300/carcassonne-die-katharer" />
      <RulesLink title="The Besiegers" href="https://boardgamegeek.com/boardgameexpansion/166518/carcassonne-die-belagerer" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Besiegers_Cathars_Siege_(1st_edition)" />
    </p>

    <h5>The Cathars</h5>

    <TileDistribution :sets="{'siege/cathars': 1}" />

    <h5>The Besiegers</h5>

    <TileDistribution :sets="{'siege/besiegers': 1}" />
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
