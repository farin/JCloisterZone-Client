<template>
  <div :class="`player-slot color-${number} ${slotState}`" @click="toggle">
    <div
      v-if="order !== null"
      :class="`order order-${order}`"
    >
      {{ order }}
    </div>
    <svg class="meeple" :width="105" :height="105">
      <use :href="`${MEEPLES_SVG}#small-follower`" />
    </svg>
    <div class="state">
      <template v-if="slotState === 'open'">open slot</template>
      <template v-if="slotState === 'local'">local player</template>
      <template v-if="slotState === 'remote'">remote player</template>
    </div>
    <div class="name">
      <template v-if="slotState === 'open'">click to assign</template>
      <template v-else>{{ name }}</template>
    </div>
  </div>
</template>

<script>
import sample from 'lodash/sample'
import { mapState } from 'vuex'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  props: {
    number: { type: Number, required: true },
    owner: { type: String, default: null },
    name: { type: String, default: null },
    order: { type: Number, default: null }
  },

  data () {
    return { MEEPLES_SVG }
  },

  computed: {
    ...mapState({
      sessionId: state => state.gameSetup.sessionId
    }),

    slotState () {
      if (this.owner === this.sessionId) {
        return 'local'
      }
      return this.owner ? 'remove' : 'open'
    }
  },

  methods: {
    toggle () {
      const { number } = this
      if (this.slotState === 'local') {        
        this.$store.dispatch('gameSetup/releaseSlot', { number })                
      } else if (this.slotState === 'open') {
        this.$store.dispatch('gameSetup/takeSlot', { number })
      }      
    }
  }
}
</script>

<style lang="sass" scoped>
.player-slot
  position: relative
  background: white
  padding: 40px 0 30px 0

  display: flex
  flex-direction: column
  align-items: center
  overflow: hidden

  .order
    position: absolute
    top: -70px
    right: -37px
    color: white
    font-size: 224px
    font-weight: 900
    opacity: 0.4

  .order-1
    right: -48px

  .order-4
    right: -34px

  svg
    margin-bottom: 30px

  .state
    font-size: 24px
    text-transform: uppercase
    font-weight: 300
    color: #444
    margin-bottom: 15px

  .name
    font-size: 24px
    height: 36px

  &.open
    .name
      font-size: 16px
      font-style: italic
      padding-top: 8px
      color: #444

  &.open, &.local
    cursor: pointer

  &.local
    background: $selection-bg
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15), 0 3px 10px 0 rgba(0, 0, 0, 0.10)
</style>
