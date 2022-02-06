<template>
  <v-card>
    <v-card-title class="headline">
      Game Setup
    </v-card-title>
    <v-card-text>
      <GameSetupOverview :setup="setup" />
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

import GameSetupOverview from '@/components/game-setup/overview/GameSetupOverview'

export default {
  components: {
    GameSetupOverview
  },

  props: {
  },

  computed: {
    ...mapState({
      setup: state => state.game.setup
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

.v-card__text
  padding-bottom: 0 !important
</style>
