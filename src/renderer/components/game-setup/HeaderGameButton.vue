<template>
  <div class="header-game-button">
    <div v-if="java && java.error === 'not-found'" class="warning-text">
      Java is not installed!
    </div>
    <div v-else-if="java && java.error === 'outdated'" class="warning-text">
      Java is outdated!
    </div>
    <div v-else-if="engine && engine.error" class="warning-text">
      Game engine not available.
    </div>
    <div v-else-if="!containsCoreSet" class="info-text">
      No core set!
    </div>
    <div v-else-if="info" class="info-text">
      {{ info }}
    </div>

    <v-btn large color="primary" :disabled="!engine.ok || !containsCoreSet || !!info" @click="ev => $emit('click', ev)">
      <v-icon left>fas fa-play</v-icon>
      {{ title }}
    </v-btn>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import ExpansionSymbol from '@/components/ExpansionSymbol'
import FiguresTab from '@/components/game-setup/tabs/FiguresTab'
import GameAnnotationsPanel from '@/components/dev/GameAnnotationsPanel'
import GameSetupGrid from '@/components/game-setup/GameSetupGrid'
import TileDistribution from '@/components/TileDistribution'
import TilePackSize from '@/components/game/TilePackSize'
import TileSetsTab from '@/components/game-setup/tabs/TileSetsTab'
import TimerTab from '@/components/game-setup/tabs/TimerTab'
import RulesTab from '@/components/game-setup/tabs/RulesTab'

export default {
  props: {
    title: { type: String, required: true },
    info: { type: String, default: null }
  },

  computed: {
    ...mapState({
      java: state => state.java,
      engine: state => state.engine
    }),

    ...mapGetters({
      containsCoreSet: 'gameSetup/containsCoreSet'
    })
  }
}
</script>

<style lang="sass" scoped>
.header-game-button
  display: flex
  align-items: center

.warning-text, .info-text
  font-size: 24px
  white-space: nowrap
  color: white
  margin: 0 20px
  padding: 0 10px
  border-radius: 4px

.warning-text
  background-color: #F44336

.info-text
  background-color: #3F51B5
</style>

