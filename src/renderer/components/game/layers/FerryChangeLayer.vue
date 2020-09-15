<template>
  <g id="ferry-change-layer">
    <g
      v-for="({ key, position, NS, WE, NW, NE, SW, SE }) in positions"
      :key="key"
      :transform="transformPosition(position)"
    >
      <rect
        v-if="WE"
        :class="{area: true, 'over-only': NS, mouseover: isMouseOver(position, 'WE')}"
        x="70" y="430" width="860" height="140"
      />
      <rect
        v-if="NS"
        :class="{area: true, 'over-only': WE, mouseover: isMouseOver(position, 'NS')}"
        x="430" y="70" width="140" height="860"
      />

      <g v-if="WE && NS">
        <rect
          x="570" y="430" width="360" height="140"
          :class="{'out-only': true, mouseover: isMouseOver(position, 'WE')}"
        />
        <rect
          x="70" y="430" width="360" height="140"
          :class="{'out-only': true, mouseover: isMouseOver(position, 'WE')}"
        />
        <rect
          x="430" y="570" width="140" height="360"
          :class="{'out-only': true, mouseover: isMouseOver(position, 'NS')}"
        />
        <rect
          x="430" y="70" width="140" height="360"
          :class="{'out-only': true, mouseover: isMouseOver(position, 'NS')}"
        />
        <rect
          x="430" y="430" width="140" height="140"
          :class="{'out-only': true, mouseover: isMouseOver(position, 'NS') || isMouseOver(position, 'WE')}"
        />

        <rect
          x="570" y="430" width="360" height="140"
          class="tracking-area"
          @mouseenter="onMouseOver(position, 'WE')"
          @mouseleave="onMouseLeave"
          @click="ev => onClick(ev, position, 'WE')"
        />
        <rect
          x="70" y="430" width="360" height="140"
          class="tracking-area"
          @mouseenter="onMouseOver(position, 'WE')"
          @mouseleave="onMouseLeave"
          @click="ev => onClick(ev, position, 'WE')"
        />
        <rect
          x="430" y="570" width="140" height="360"
          class="tracking-area"
          @mouseenter="onMouseOver(position, 'NS')"
          @mouseleave="onMouseLeave"
          @click="ev => onClick(ev, position, 'NS')"
        />
        <rect
          x="430" y="70" width="140" height="360"
          class="tracking-area"
          @mouseenter="onMouseOver(position, 'NS')"
          @mouseleave="onMouseLeave"
          @click="ev => onClick(ev, position, 'NS')"
        />
      </g>
      <g v-else>
        <rect
          v-if="WE"
          x="70" y="430" width="860" height="140"
          class="tracking-area"
          @mouseenter="onMouseOver(position, 'WE')"
          @mouseleave="onMouseLeave"
          @click="ev => onClick(ev, position, 'WE')"
        />
        <rect
          v-if="NS"
          x="430" y="70" width="140" height="860"
          class="tracking-area"
          @mouseenter="onMouseOver(position, 'NS')"
          @mouseleave="onMouseLeave"
          @click="ev => onClick(ev, position, 'NS')"
        />
      </g>

      <path
        v-if="NW"
        d="M 70 430 l -140 0 A 500 500 0 0 1 430 -70 l 0 140 A 360 360 0 0 0 70 430 Z"
        :class="{ area: true, mouseover: isMouseOver(position, 'NW')}"
        @mouseenter="onMouseOver(position, 'NW')"
        @mouseleave="onMouseLeave"
        @click="ev => onClick(ev, position, 'NW')"
      />
      <path
        v-if="NE"
        d="M 70 430 l -140 0 A 500 500 0 0 1 430 -70 l 0 140 A 360 360 0 0 0 70 430 Z"
        transform="rotate(90 500 500)"
        :class="{ area: true, mouseover: isMouseOver(position, 'NE')}"
        @mouseenter="onMouseOver(position, 'NE')"
        @mouseleave="onMouseLeave"
        @click="ev => onClick(ev, position, 'NE')"
      />
      <path
        v-if="SE"
        d="M 70 430 l -140 0 A 500 500 0 0 1 430 -70 l 0 140 A 360 360 0 0 0 70 430 Z"
        transform="rotate(180 500 500)"
        :class="{ area: true, mouseover: isMouseOver(position, 'SE')}"
        @mouseenter="onMouseOver(position, 'SE')"
        @mouseleave="onMouseLeave"
        @click="ev => onClick(ev, position, 'SE')"
      />
      <path
        v-if="SW"
        d="M 70 430 l -140 0 A 500 500 0 0 1 430 -70 l 0 140 A 360 360 0 0 0 70 430 Z"
        transform="rotate(270 500 500)"
        :class="{ area: true, mouseover: isMouseOver(position, 'SW')}"
        @mouseenter="onMouseOver(position, 'SW')"
        @mouseleave="onMouseLeave"
        @click="ev => onClick(ev, position, 'SW')"
      />
    </g>
  </g>
</template>

<script>
import groupBy from 'lodash/groupBy'
import { isSameFeature } from '@/utils/gameUtils'

import LayerMixin from '@/components/game/layers/LayerMixin'

export default {
  components: {
  },

  mixins: [LayerMixin],

  props: {
    options: { type: Array, required: true }
  },

  data () {
    return {
      mouseOver: null
    }
  },

  computed: {
    positions () {
      return Object.entries(groupBy(this.options, opt => this.positionAsKey(opt.position))).map(([key, options]) => {
        const locations = options.map(opt => opt.location)
        const NS = locations.includes('NS')
        const WE = locations.includes('WE')
        const NW = locations.includes('NW')
        const NE = locations.includes('NE')
        const SW = locations.includes('SW')
        const SE = locations.includes('SE')
        return {
          key,
          position: options[0].position,
          NS, WE, NW, NE, SW, SE // eslint-disable-line object-property-newline
        }
      })
    }
  },

  methods: {
    onMouseOver (position, location) {
      this.mouseOver = { position, location }
    },

    onMouseLeave () {
      this.mouseOver = null
    },

    isMouseOver (position, location) {
      if (this.mouseOver === null) {
        return false
      }
      return isSameFeature({ position, location }, this.mouseOver)
    },

    onClick (ev, position, location) {
      if (this.isDragging(ev)) {
        return
      }
      this.$root.$emit('ferry.select', { position, location })
    }
  }
}
</script>

<style lang="sass" scoped>
.tracking-area
  pointer-events: all
  fill: none

.area, .out-only
  fill: white
  fill-opacity: 0.6

.over-only
  fill-opacity: 0

.out-only.moveuseover
  fill-opacity: 0

.area.mouseover
  fill-opacity: 0.96
  stroke: black
  stroke-width: 2px

</style>
