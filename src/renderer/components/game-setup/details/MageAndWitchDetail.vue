<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/118618/carcassonne-mage-witch" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Mage_and_Witch" />
      <RulesLink title="Rules (1st ed.)" href="http://wikicarpedia.com/index.php/Mage_and_Witch_(1st_edition)" />
    </p>

    <TileDistribution :sets="{'mage-and-witch': 1}" />
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
