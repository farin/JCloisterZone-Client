<template>
  <div
    class="element-box"
    :class="{off: !isConfigValueEnabled(value), small}"
  >
    <div class="symbol-wrapper">
      <svg v-if="isMeeple(element)" class="meeple" :width="55" :height="55">
        <use :href="`${MEEPLES_SVG}#${element}`" />
      </svg>
      <img v-else-if="element === 'garden'" src="~/assets/features/C1/garden.png" width="80" height="55">
      <NeutralFigure v-else-if="element === 'fairy'" figure="fairy" :width="55" :height="55" />
      <NeutralFigure v-else-if="element === 'dragon'" figure="dragon" :width="110" :height="55" />
      <NeutralFigure v-else-if="element === 'count'" figure="count" :width="55" :height="55" />
      <StandaloneTileImage v-else-if="element === 'abbey'" tile-id="AM/A" :size="55" />
      <img v-else-if="element === 'tower'" src="~/assets/figures/tower-alt.png" height="55">
      <img v-else-if="element === 'bridge'" src="~/assets/figures/bridge-alt.png" height="55">
      <img v-else-if="element === 'castle'" src="~/assets/figures/castle.png" width="66" height="55">
      <img v-else-if="element === 'little-buildings'" src="~/assets/figures/lb.png" width="55" height="55">
      <img v-else-if="element === 'king'" src="~/assets/figures/king.png" width="55" height="55">
      <img v-else-if="element === 'robber'" src="~/assets/figures/robber.png" width="55" height="55">
      <img v-else-if="element === 'traders'" src="~/assets/figures/trade.png" height="45">
    </div>
    <div class="box-title">
      <template v-if="element === 'traders'">Trade Goods</template>
      <template v-else>{{ element.replace('-', ' ') }}</template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import uniq from 'lodash/uniq'

import { Expansion } from '@/models/expansions'
import { isConfigValueEnabled, getDefaultElements } from '@/models/elements'
import ExpansionSymbol from '@/components/ExpansionSymbol'
import NeutralFigure from '@/components/game/NeutralFigure'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

const MEEPLES_SVG = require('~/assets/meeples.svg')
const MEEPLES = ['small-follower', 'abbot', 'phantom', 'big-follower', 'builder', 'pig', 'mayor', 'wagon', 'barn', 'shepherd']

export default {
  components: {
    ExpansionSymbol,
    NeutralFigure,
    StandaloneTileImage
  },

  props: {
    element: { type: String, required: true },
    value: { type: [String, Number, Boolean], required: true },
    small: { type: Boolean }
  },

  data () {
    return { MEEPLES_SVG }
  },

  methods: {
    isMeeple (el) {
      return MEEPLES.includes(el)
    },

    isConfigValueEnabled (val) {
      return isConfigValueEnabled(val)
    }
  }
}
</script>

<style lang="sass" scoped>
.element-box.off
  background: #FFEBEE

  .symbol-wrapper
    opacity: 0.2

  .box-title
    text-decoration: line-through
    text-decoration-color: $removed-color

.element-box.small
  .symbol-wrapper
    transform: scale(0.66)

.meeple, .fairy, .dragon, .count
  fill: #f0f0f0
</style>
