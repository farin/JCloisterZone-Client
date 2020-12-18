<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/12903/carcassonne-count-carcassonne" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Count,_King_and_Robber" />
      <RulesLink title="Rules (1st ed.)" href="http://wikicarpedia.com/index.php/Count,_King_and_Robber_(1st_edition)" />
    </p>

    <CountMiniboard :tile-size="80" />
  </div>
</template>

<script>
import RulesLink from '@/components/RulesLink'
import CountMiniboard from '@/components/game-setup/details/CountMiniboard'

export default {
  components: {
    RulesLink,
    CountMiniboard
  }
}
</script>

<style lang="sass" scoped>
</style>
