<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/168121/carcassonne-darmstadt" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Darmstadt_Promo_(1st_edition)" />
    </p>

    <p>
      Originally released in 2014.
    </p>

    <TileDistribution :sets="{'darmstadt': 1}" />
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
