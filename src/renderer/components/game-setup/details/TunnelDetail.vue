<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/59065/carcassonne-der-tunnel" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/The_Tunnel_(1st_edition)" />
    </p>

    <TileDistribution :sets="{'tunnel': 1}" />
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
