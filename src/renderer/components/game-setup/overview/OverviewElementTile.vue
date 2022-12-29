<template>
  <OverviewTile
    :enabled="enabled"
    :z-index="zIndex"
  >
    <svg v-if="isMeeple(element)" class="meeple" :width="70" :height="70">
      <use :href="`${MEEPLES_SVG}#${element}`" />
    </svg>
    <img v-else-if="element === 'garden'" src="~/assets/features/C1/garden.png" width="80" height="55">
    <NeutralFigure v-else-if="element === 'fairy'" figure="fairy" :width="70" :height="70" />
    <NeutralFigure v-else-if="element === 'dragon'" figure="dragon" :width="80" :height="40" />
    <NeutralFigure v-else-if="element === 'count'" figure="count" :width="70" :height="70" />
    <StandaloneTileImage v-else-if="element === 'abbey'" tile-id="AM/A" :size="70" />
    <img v-else-if="element === 'tower'" src="~/assets/figures/tower-alt.png" height="45">
    <img v-else-if="element === 'bridge'" src="~/assets/figures/bridge-alt.png" height="45">
    <img v-else-if="element === 'castle'" src="~/assets/figures/castle.png" width="66" height="55">
    <img v-else-if="element === 'little-buildings'" src="~/assets/figures/lb.png" width="70" height="70">
    <img v-else-if="element === 'king'" src="~/assets/figures/king.png" width="70" height="70">
    <img v-else-if="element === 'robber'" src="~/assets/figures/robber.png" width="70" height="70">
    <img v-else-if="element === 'traders'" src="~/assets/figures/trade.png" height="28">
    <img v-else-if="element === 'gold'" src="~/assets/figures/gold.png" width="70" height="37">
    <img v-else-if="element === 'inn'" src="~/assets/features/C1/inn.png" width="55" height="55">
    <img v-else-if="element === 'cathedral'" src="~/assets/features/C1/cathedral.png" width="55" height="55">
    <svg v-else-if="element === 'farmers'" class="meeple" :width="70" :height="70">
      <g transform="translate(42 32) scale(0.6) rotate(90) translate(-27 -27)">
        <use :href="`${MEEPLES_SVG}#small-follower`" />
      </g>
    </svg>
    <img v-else-if="element === 'princess'" src="~/assets/features/C1/princess.png" height="55">
    <img v-else-if="element === 'portal'" src="~/assets/features/C1/magic_portal.png" height="55">
    <img v-else-if="element === 'pig-herd'" src="~/assets/features/C1/pig_herd.jpg" height="55">
    <img v-else-if="element === 'vineyard'" src="~/assets/features/C1/vineyard.png" height="55">
    <img v-else-if="element === 'bazaar'" src="~/assets/features/C1/bazaar.png" height="45">
    <img v-else-if="element === 'hill'" src="~/assets/features/C1/hill.png" height="55">
    <img v-else-if="element === 'shrine'" src="~/assets/features/C1/shrine.jpg" height="55">
    <img v-else-if="element === 'festival'" src="~/assets/features/C1/festival.png" height="55">
    <img v-else-if="element === 'escape'" src="~/assets/features/C1/escape.png" height="55">

    <template #quantity>
      <div class="quantity" :class="enabled ? 'addition': 'removal'">
        {{ label }}
      </div>
    </template>

    <template #title>
      <template v-if="element === 'traders'">{{ $t('expansions.traders-and-builders.trade-goods') }}</template>
      <template v-else>{{ element.replace('-', ' ') }}</template>
    </template>
  </OverviewTile>
</template>

<script>
import NeutralFigure from '@/components/game/NeutralFigure'
import OverviewTile from '@/components/game-setup/overview/OverviewTile'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

const MEEPLES_SVG = require('~/assets/meeples.svg')
const MEEPLES = ['small-follower', 'abbot', 'phantom', 'big-follower', 'builder', 'pig', 'mayor', 'wagon', 'barn', 'shepherd']

export default {
  components: {
    NeutralFigure,
    OverviewTile,
    StandaloneTileImage
  },

  props: {
    element: { type: String, required: true },
    value: { type: [String, Number, Boolean], required: true },
    zIndex: { type: Number, default: 1 }
  },

  data () {
    return { MEEPLES_SVG }
  },

  computed: {
    enabled () {
      return this.value === true || this.value > 0
    },

    label () {
      if (this.value === true || this.value === 1) return '+'
      if (this.value === false) return '-'
      if (this.value > 0) return '+' + this.value
      return '' + this.value
    }
  },

  methods: {
    isMeeple (el) {
      return MEEPLES.includes(el)
    }
  }
}
</script>

<style lang="sass" scoped>
.tile-img, img
  filter: grayscale(100%)
</style>
