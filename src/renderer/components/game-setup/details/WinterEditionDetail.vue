<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/131014/carcassonne-winter-edition" />
    </p>

    <p>
      {{ $t('tile-sets.winter-edition-description') }}
    </p>

    <TileDistribution :sets="{winter: 1}" />
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
