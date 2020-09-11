<template>
  <div>
    <p>
      <RulesLink href="https://boardgamegeek.com/boardgameexpansion/12903/carcassonne-count-carcassonne" />
      <RulesLink title="Rules" href="http://wikicarpedia.com/index.php/Count,_King_and_Robber" />
      <RulesLink title="Rules (1st ed.)" href="http://wikicarpedia.com/index.php/Count,_King_and_Robber_(1st_edition)" />
    </p>

    <Miniboard
      :tile-size="80"
      :tiles="countTiles"
    />
  </div>
</template>

<script>
import RulesLink from '@/components/RulesLink'
import Miniboard from '@/components/game-setup/Miniboard'

export default {
  components: {
    RulesLink,
    Miniboard
  },

  data () {
    return {
      countTiles: [
        { tile: 'CO/1', x: -2, y: -1, rotation: 0 },
        { tile: 'CO/2', x: -1, y: -1, rotation: 0 },
        { tile: 'CO/3', x: 0, y: -1, rotation: 0 },
        { tile: 'CO/4', x: 1, y: -1, rotation: 0 },
        { tile: 'CO/5', x: -2, y: 0, rotation: 0 },
        { tile: 'CO/6', x: -1, y: 0, rotation: 0 },
        { tile: 'CO/7', x: 0, y: 0, rotation: 0 },
        { tile: 'CO/8', x: 1, y: 0, rotation: 0 },
        { tile: 'CO/9', x: -2, y: 1, rotation: 0 },
        { tile: 'CO/10', x: -1, y: 1, rotation: 0 },
        { tile: 'CO/11', x: 0, y: 1, rotation: 0 },
        { tile: 'CO/12', x: 1, y: 1, rotation: 0 }
      ]
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
