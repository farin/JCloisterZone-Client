<template>
  <QuantityButtons
    v-model="quantity"
    :min="set.min || 0"
    :max="set.max || 3"
    :mutable="mutable"
  >
    <slot/>
  </QuantityButtons>
</template>

<script>
import QuantityButtons from '@/components/game-setup/buttons/QuantityButtons'

export default {
  components: {
    QuantityButtons
  },

  props: {
    set: { type: Object, required: true },
    mutable: { type: Boolean, default: true }
  },

  computed: {
    quantity: {
      get () {
        const sets = this.$store.state.gameSetup.sets || {}
        return sets[this.set.id] || 0
      },

      set (value) {
        this.$store.dispatch('gameSetup/setTileSetQuantity', { id: this.set.id, quantity: value })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
