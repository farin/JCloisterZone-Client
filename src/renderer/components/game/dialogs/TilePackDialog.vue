<template>
  <v-card>
    <v-card-title class="headline">
      Tiles
      <div  v-if="!options.puristTiles" class="switch-wrapper">
        <v-switch
          v-model="showAvailableOnly"
          dense
          hide-details
          label="show available only"
        />
      </div>
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

      <template v-if="options.puristTiles">
        <h2>Game Tiles</h2>
        <p>The game was created with option which doesn't allow showing remaining tiles count.</p>
        <TileDistribution :sets="sets" :rules="rules" />
      </template>
      <template v-else>
        <h2>Remaining tiles</h2>

        <div
          v-if="underHills"
          class="hills-info"
        >
          <img src="~/assets/features/C1/hill.png" height="55">
          <p v-if="underHills > 1">Don't forget that <b>{{ underHills }}</b> unknown tiles from list are hidden under hills.</p>
          <p v-else>Don't forget that <b>1</b> unknown tile from list is hidden under a hill.</p>
        </div>

        <TileDistributionLive :sets="sets" :rules="rules" :available-only="showAvailableOnly" />
      </template>
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
import TileDistribution from '@/components/TileDistribution'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

export default {
  components: {
    StandaloneTileImage,
    TileDistribution,
    TileDistributionLive
  },

  props: {
  },

  data () {
    return {
      showAvailableOnly: false
    }
  },

  computed: {
    ...mapState({
      sets: state => state.game.setup?.sets,
      rules: state => state.game.setup?.rules,
      removedTiles: state => state.game.discardedTiles,
      options: state => state.game.setup.options,
      underHills: state => state.game.tilePack.underHills
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
  margin-top: 10px
  font-style: italic

.hills-info
  display: flex
  align-items: center
  margin-bottom: 20px
  padding: 10px 20px
  border-radius: 6px

  +theme using ($theme)
    background-color: map-get($theme, 'board-bg')

  img
    margin-right: 40px

  p
    font-size: 18px
    margin: 0

.headline
  position: relative

.switch-wrapper
  position: absolute
  top: 14px
  right: 50px
  font-size: 14px
  font-weight: normal
  letter-spacing: normal

  .v-input
    margin: 0
</style>
