<template>
  <QuantityButtons
    v-model="quantity"
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
    set: { type: [Object, Array], required: true },
    mutable: { type: Boolean, default: true }
  },

  computed: {
    quantity: {
      get () {
        const sets = this.$store.state.gameSetup.sets || {}
        return sets[Array.isArray(this.set) ? this.set[0].id : this.set.id] || 0
      },

      set (value) {
        if (Array.isArray(this.set)) {
          this.set.forEach(set => {
            this.$store.dispatch('gameSetup/setTileSetQuantity', { id: set.id, quantity: value })
          })
        } else {
          this.$store.dispatch('gameSetup/setTileSetQuantity', { id: this.set.id, quantity: value })
        }
      }
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
