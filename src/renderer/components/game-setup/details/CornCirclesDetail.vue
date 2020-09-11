<template>
  <div>
    <p>
      <RulesLink title="Corn Circles I" href="https://boardgamegeek.com/boardgame/67055/carcassonne-die-kornkreise" />
      <RulesLink title="Corn Circles II" href="https://boardgamegeek.com/boardgame/120686/carcassonne-corn-circles-ii" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Crop_Circles" />
      <RulesLink title="Rules (1st ed.)" href="http://wikicarpedia.com/index.php/Crop_Circles_(1st_edition)" />
    </p>

    <h5>Corn Circles I</h5>
    <TileDistribution :sets="{'corn-circles/1': 1}" />

    <h5>Corn Circles II</h5>
    <TileDistribution :sets="{'corn-circles/2': 1}" />
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
