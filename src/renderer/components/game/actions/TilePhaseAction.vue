<template>
  <section>
    <span v-if="actionItem.tileId == 'AM/A'" class="text">
      {{ local ? 'You may place an abbey' : 'Player may place an abbey' }}
    </span>
    <span v-else class="text">
      {{ local ? 'Place the tile' : 'Player must place the tile' }}
    </span>
    <TilePlacementItem
      :tile-id="actionItem.tileId"
      :options="actionItem.options"
      active
      :local="local"
    />
    <slot />
  </section>
</template>

<script>
import TilePlacementItem from '@/components/game/actions/items/TilePlacementItem.vue'

export default {
  components: {
    TilePlacementItem
  },

  props: {
    action: { type: Object, required: true },
    local: { type: Boolean }
  },

  computed: {
    actionItem () {
      return this.action.items[0]
    },

    /*playerName () {
      return this.$store.state.game.players[this.action.player].name
    }*/
  }
}
</script>

<style lang="sass" scoped>
.text
  font-size: 20px
  font-weight: 300
</style>
