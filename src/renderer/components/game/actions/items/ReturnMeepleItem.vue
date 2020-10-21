<template>
  <div :class="{ active }">
    <img v-if="source === 'PRINCESS'" src="~/assets/features/C1/princess.png" height="54">
    <div
      v-else-if="source === 'ABBOT_RETURN'"
      :class="{'abbot-return': true, [colorCssClass(player)]: active}"
    >
      <Meeple
        :class="{inactive: !active}"
        type="Abbot"
      />
      <v-icon class="color-overlay">fas fa-undo</v-icon>
    </div>
    <div v-else-if="source === 'FESTIVAL'">
      <img src="~/assets/features/C1/festival.png" height="74">
    </div>
    <div v-else>Return Meeple</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Meeple from '@/components/game/Meeple'
import LayeredItemMixin from '@/components/game/actions/items/LayeredItemMixin.js'

export default {
  components: {
    Meeple
  },

  mixins: [LayeredItemMixin],

  props: {
    player: { type: Number, required: true },
    source: { type: String, required: true },
    options: { type: Array, required: true },
    active: { type: Boolean }
  },

  data () {
    return {
      layer: 'MeepleSelectLayer'
    }
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass'
    }),

    layerProps () {
      return {
        options: this.options,
        local: true
      }
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
    }
  }
}
</script>

<style lang="sass" scoped>
img
  filter: grayscale(100%)

.active img
  filter: none

.abbot-return
  position: relative

  svg
    width: 74px
    height: 74px

  svg.inactive
    fill: #999
    color: white

  i
    position: absolute
    left: calc(50% - 12px)
    top: calc(50%)
    font-size: 24px
</style>
