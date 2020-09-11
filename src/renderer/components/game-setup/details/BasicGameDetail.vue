<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgame/822/carcassonne" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Base_game#Base_game" />
      <RulesLink title="Rules (1st ed.)" href="http://wikicarpedia.com/index.php/Base_game_(1st_edition)#Base_game" />
    </p>

    <p>
      You can play tiles with 1st Edition or New edition rules (eg. gardens). This can be selected in second game setup step.
    </p>

    <TileDistribution :sets="{basic: 1}" />
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
