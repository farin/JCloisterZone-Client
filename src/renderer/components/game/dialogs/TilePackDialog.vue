<template>
  <v-card>
    <v-card-title class="headline">
      Tiles
    </v-card-title>
    <v-card-text>
      <template v-if="removedTiles.length">
        <h2>Removed Tiles</h2>
        <div class="removed-tiles-list">
          <div
            v-for="(id, idx) in removedTiles"
            :key="idx"
            class="tile"
          >
            <StandaloneTileImage
              :tile-id="id"
              :size="100"
            />
          </div>
        </div>
      </template>

      <h2>Remaining tiles</h2>
      <p v-if="options.puristTiles">
        Game was created with option which doesn't allow showing remaining tiles cheat sheet.
      </p>
      <TileDistributionLive v-else :sets="sets" :rules="rules" />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        text
        @click="$emit('close')"
      >Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

import TileDistributionLive from '@/components/game/dialogs/TileDistributionLive'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

export default {
  components: {
    StandaloneTileImage,
    TileDistributionLive
  },

  props: {
  },

  computed: {
    ...mapState({
      sets: state => state.game.setup?.sets,
      rules: state => state.game.setup?.rules,
      removedTiles: state => state.game.discardedTiles,
      options: state => state.game.setup.options
    })
  }
}

</script>

<style lang="sass" scoped>
h2
  font-weight: 300
  font-size: 16px
  text-transform: uppercase
  text-align: center
  margin: 10px 0

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')

.removed-tiles-list
  display: flex
  flex-wrap: wrap

  svg
    margin: 0 2px

p
  text-align: center
  margin-top: 20px
  font-size: 18px
</style>
