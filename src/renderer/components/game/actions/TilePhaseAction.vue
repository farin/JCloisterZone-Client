<template>
  <section>
    <span v-if="actionItem.tileId == 'AM/A'" class="text">
      {{ local ? $t('game.action.you-may-place-an-abbey') : $t('game.action.player-may-place-an-abbey') }}
    </span>
    <span v-else class="text">
      {{ local ? $t('game.action.place-the-tile') : $t('game.action.player-must-place-the-tile') }}
    </span>
    <TilePlacementItem
      :tile-id="actionItem.tileId"
      :options="actionItem.options"
      active
      :local="local"
    />
    <slot :label="phase === 'AbbeyPhase' ? $t('game.action.draw-a-tile') : null" />
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
    phase: { type: String, required: true },
    local: { type: Boolean }
  },

  computed: {
    actionItem () {
      return this.action.items[0]
    }
  }
}
</script>

<style lang="sass" scoped>
.text
  font-size: 20px
  font-weight: 300
</style>
