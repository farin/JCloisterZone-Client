<template>
  <v-card>
    <v-card-title class="headline">
      Game Setup
    </v-card-title>
    <v-card-text>
      <GameSetupOverview :sets="sets" :elements="elements" :timer="timer" />

      <div class="rules">
        <h2>Altered Gameplay</h2>
        <GameplayVariants :setup="setup" show="changed" read-only />
      </div>

      <div class="rules">
        <h2>Altered Scoring</h2>
        <ScoringVariants :setup="setup" show="changed" read-only />
      </div>
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
import GameplayVariants from '@/components/game-setup/rules/GameplayVariants'
import ScoringVariants from '@/components/game-setup/rules/ScoringVariants'

export default {
  components: {
    GameSetupOverview,
    GameplayVariants,
    ScoringVariants
  },

  props: {
  },

  computed: {
    ...mapState({
      setup: state => state.game.setup,
      sets: state => state.game.setup?.sets,
      elements: state => state.game.setup?.elements,
      timer: state => state.game.setup?.timer
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
