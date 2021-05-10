<template>
  <div class="game-setup-overview">
    <div class="label">
      <h2>Selected Tiles</h2>
    </div>
    <section>
      <OverviewTileSetTile
        v-for="{ expansion, id, title, quantity } in tileSets"
        :key="id"
        :expansion="expansion"
        :title="title"
        :quantity="quantity"
      />
    </section>
    <div v-if="additions.length" class="label">
      <h2>Additional elements</h2>
    </div>
    <section>
      <OverviewElementTile
        v-for="([element, value]) in additions"
        :key="element"
        :element="element"
        :value="value"
      />
    </section>
    <div v-if="removals.length" class="label">
      <h2>Removed Elements</h2>
    </div>
    <section>
      <OverviewElementTile
        v-for="([element, value]) in removals"
        :key="element"
        :element="element"
        :value="value"
      />
    </section>
    <div v-if="timer" class="label">
      <h2>Timer</h2>
    </div>
    <section v-if="timer" class="timer">
      <TimerValue :value="timer.initial" />
      <template v-if="timer.turn">
        &emsp;+&thinsp;<TimerValue :value="timer.turn" />
      </template>
    </section>

    <div v-if="gameplayAltred" class="rules">
      <div class="label">
        <h2>Altered Gameplay</h2>
      </div>
      <GameplayVariants :setup="setup" show="changed" read-only />
    </div>

    <div v-if="scoringAltred" class="rules">
      <div class="label">
        <h2>Altered Scoring</h2>
      </div>
      <ScoringVariants :setup="setup" show="changed" read-only />
    </div>
  </div>
</template>

<script>
import { GAMEPLAY, SCORING, Rule } from '@/models/rules'

import GameSetupOverviewMixin from '@/components/game-setup/overview/GameSetupOverviewMixin'
import GameplayVariants from '@/components/game-setup/rules/GameplayVariants'
import OverviewElementTile from '@/components/game-setup/overview/OverviewElementTile'
import OverviewTileSetTile from '@/components/game-setup/overview/OverviewTileSetTile'
import ScoringVariants from '@/components/game-setup/rules/ScoringVariants'
import TimerValue from '@/components/game-setup/overview/TimerValue'


export default {
  components: {
    GameplayVariants,
    OverviewElementTile,
    OverviewTileSetTile,
    ScoringVariants,
    TimerValue
  },

  mixins: [GameSetupOverviewMixin],

  props: {
    setup: { type: Object, required: true }
  },

  computed: {
    sets () { return this.setup?.sets },
    rules () { return this.setup?.rules },
    elements () { return this.setup?.elements },
    timer () { return this.setup?.timer },

    gameplayAltred () {
      return Rule.all().filter(r => r.kind === GAMEPLAY).some(r => r.default !== this.rules[r.id])
    },

    scoringAltred () {
      return Rule.all().filter(r => r.kind === SCORING).some(r => r.default !== this.rules[r.id])
    }
  }
}
</script>

<style lang="sass" scoped>
section
  display: flex
  flex-wrap: wrap

  .element-box
    width: 80px
    height: 105px
    margin: 1.5px

    +theme using ($theme)
      background-color: map-get($theme, 'overview-tile-bg')

    &.off
      +theme using ($theme)
        background: map-get($theme, 'overview-tile-off-bg')

    ::v-deep .symbol
      height: 80px

  &.timer
    display: block
    text-align: center
    font-size: 26px
    font-weight: 300

.label
  text-align: center
  margin: 20px 0 10px 0

  h2
    font-weight: 300
    font-size: 16px
    text-transform: uppercase

    +theme using ($theme)
      color: map-get($theme, 'gray-text-color')

</style>
