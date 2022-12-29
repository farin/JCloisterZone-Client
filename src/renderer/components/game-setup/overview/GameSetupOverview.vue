<template>
  <div class="game-setup-overview">
    <div class="label">
      <h3>{{ $t('game-setup.selected-tiles') }}</h3>
    </div>
    <section>
      <OverviewExpansionTile
        v-for="{ expansion, id, title, quantity } in releases"
        :key="id"
        :expansion="expansion"
        :title="title"
        :quantity="quantity"
      />
    </section>
    <div v-if="additions.length" class="label">
      <h3>{{ $t('game-setup.additional-elements') }}</h3>
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
      <h3>{{ $t('game-setup.removed-elements') }}</h3>
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
      <h3>{{ $t('game-setup.header.timer') }}</h3>
    </div>
    <section v-if="timer" class="timer">
      <TimerValue :value="timer.initial" />
      <template v-if="timer.turn">
        &emsp;+&thinsp;<TimerValue :value="timer.turn" />
      </template>
    </section>

    <div v-if="gameplayAltred" class="rules">
      <div class="label">
        <h3>{{ $t('game-setup.altered-gameplay') }}</h3>
      </div>
      <GameplayVariants :setup="setup" show="changed" read-only />
    </div>

    <div v-if="scoringAltred" class="rules">
      <div class="label">
        <h3>{{ $t('game-setup.altered-scoring') }}</h3>
      </div>
      <ScoringVariants :setup="setup" show="changed" read-only />
    </div>

    <v-divider />

    <div class="setup-buttons">
      <v-btn v-if="!$store.getters['settings/isMySetup'](setup)" small color="secondary" @click="addToMySetups">
        <v-icon left>far fa-heart</v-icon>
        {{ $t('button.add-to-favorities') }}
      </v-btn>
      <v-btn v-else small color="secondary" @click="removeFromMySetups">
        <v-icon left>fa-heart</v-icon>
        {{ $t('button.remove-from-favorites') }}
      </v-btn>
      <v-btn small color="secondary" @click="saveGameSetup">
        <v-icon left>fa-file</v-icon>
        {{ $t('button.save-to-file') }}
      </v-btn>
    </div>
  </div>
</template>

<script>
import { GAMEPLAY, SCORING, Rule } from '@/models/rules'

import GameSetupOverviewMixin from '@/components/game-setup/overview/GameSetupOverviewMixin'
import GameplayVariants from '@/components/game-setup/rules/GameplayVariants'
import OverviewElementTile from '@/components/game-setup/overview/OverviewElementTile'
import OverviewExpansionTile from '@/components/game-setup/overview/OverviewExpansionTile'
import ScoringVariants from '@/components/game-setup/rules/ScoringVariants'
import TimerValue from '@/components/game-setup/overview/TimerValue'

export default {
  components: {
    GameplayVariants,
    OverviewElementTile,
    OverviewExpansionTile,
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
      return Rule.all().filter(r => r.kind === GAMEPLAY).some(r => this.rules[r.id] !== undefined && r.default !== this.rules[r.id])
    },

    scoringAltred () {
      return Rule.all().filter(r => r.kind === SCORING).some(r => this.rules[r.id] !== undefined && r.default !== this.rules[r.id])
    }
  },

  methods: {
    addToMySetups () {
      this.$store.dispatch('settings/addMySetup', this.setup)
    },

    removeFromMySetups () {
      this.$store.dispatch('settings/removeMySetup', this.setup)
    },

    saveGameSetup () {
      this.$store.dispatch('game/save', { onlySetup: true })
    }
  }
}
</script>

<style lang="sass" scoped>
section
  display: flex
  flex-wrap: wrap
  padding: 0 20px

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
  padding: 20px 0 10px 0

  h2, h3
    font-weight: 300
    font-size: 16px
    text-transform: uppercase

    +theme using ($theme)
      color: map-get($theme, 'gray-text-color')

.v-divider
  margin-top: 20px

.setup-buttons
  padding: 20px
  display: flex
  flex-direction: column
  align-items: flex-start

  .v-btn
    margin-bottom: 10px

</style>
