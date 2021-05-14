<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/211023/carcassonne-watchtowers" />
      <RulesLink title="Rules" href="https://wikicarpedia.com/index.php/The_Watchtowers" />
    </p>

    <h5>Tiles</h5>
    <TileDistribution :sets="{'watchtowers': 1}" />

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
