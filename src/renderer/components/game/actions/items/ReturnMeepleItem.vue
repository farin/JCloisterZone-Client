<template>
  <div :class="{ active }">
    <img v-if="source === 'PRINCESS'" src="~/assets/features/C1/princess.png" height="54">
    <div
      v-else-if="source === 'ABBOT_RETURN'"
      :class="{'meeple-return': true, 'abbot-return': true, [colorCssClass(player)]: active}"
    >
      <Meeple
        :class="{inactive: !active}"
        type="Abbot"
      />
      <v-icon class="color-overlay">fas fa-undo</v-icon>
    </div>
    <div v-else-if="source === 'ROBBERSSON'">
      <img src="~/assets/features/C1/robbersson.png" height="74">
    </div>
    <div v-else-if="source === 'FESTIVAL'">
      <img src="~/assets/features/C1/festival.png" height="74">
    </div>
    <div
      v-else-if="source === 'TRAP'"
      class="meeple-return trap"
    >
      <StandaloneTileImage
        tile-id="RU/V"
        :size="48"
      />
      <StandaloneTileImage
        tile-id="RU/SR"
        :size="48"
      />
      <v-icon class="color-overlay">fas fa-undo</v-icon>
    </div>
    <div
      v-else
      :class="{'meeple-return': true, [colorCssClass(player)]: active}"
    >
      <Meeple
        :class="{inactive: !active}"
        :type="getTypeFromId(options)"
      />
      <v-icon class="color-overlay">fas fa-undo</v-icon>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Meeple from '@/components/game/Meeple'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'
import LayeredItemMixin from '@/components/game/actions/items/LayeredItemMixin.js'

export default {
  components: {
    Meeple,
    StandaloneTileImage
  },

  mixins: [LayeredItemMixin],

  props: {
    player: { type: Number, required: true },
    source: { type: String, required: true },
    options: { type: Array, required: true },
    active: { type: Boolean }
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass'
    }),

    layers () {
      return [['MeepleSelectLayer', {
        options: this.options,
        local: true
      }]]
    }
  },

  mounted () {
    this.$root.$on('meeple.select', this.onSelect)
  },

  beforeDestroy () {
    this.$root.$off('meeple.select', this.onSelect)
  },

  methods: {
    async onSelect (ptr) {
      if (this.active) {
        await this.$store.dispatch('game/apply', {
          type: 'RETURN_MEEPLE',
          payload: {
            source: this.source,
            pointer: ptr
          }
        })
      }
    },

    getTypeFromId (options) {
      const t = options[0].meepleId.split('.')[1]
      if (t === 'small') return 'SmallFollower'
      if (t === 'big') return 'BigFollower'
      return t
    }
  }
}
</script>

<style lang="sass" scoped>
img, svg
  filter: grayscale(100%)

.active
  img, svg
    filter: none

.meeple-return
  position: relative

  svg
    width: 74px
    height: 74px

    @media (max-height: 768px)
      width: 54px
      height: 54px

  svg.inactive
    fill: #999
    color: white

  i
    position: absolute
    left: calc(50% - 12px)
    top: calc(35%)
    font-size: 24px

.abbot-return
  i
    top: calc(50%)

.trap
  svg.tile-img
    width: auto
    height: auto
    position: relative

  i
    color: white
    font-size: 28px

  [data-tile-id='RU/V']
    top: -5px
    left: 15px

  [data-tile-id='RU/SR']
    top: 14px
    left: -17px
</style>
