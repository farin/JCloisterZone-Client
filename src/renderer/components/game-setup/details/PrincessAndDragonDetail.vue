<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/15158/carcassonne-expansion-3-princess-dragon" />
      <RulesLink :title="$t('button.rules')" href="http://wikicarpedia.com/index.php/Special:MyLanguage/The_Princess_and_The_Dragon" />
      <RulesLink :title="$t('button.rules-1st-edition')" href="http://wikicarpedia.com/index.php/Special:MyLanguage/The_Princess_and_The_Dragon_(1st_edition)" />
    </p>

    <p>
      {{ $t('tile-set.princess-and-dragon-release') }}
    </p>

    <TileDistribution :sets="{'princess-and-dragon': 1}" />
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
