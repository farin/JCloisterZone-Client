<template>
  <QuantityButtons
    v-model="quantity"
    :max="max"
    :mutable="mutable"
  />
</template>

<script>
import QuantityButtons from '@/components/game-setup/buttons/QuantityButtons'

// TODO merge with set buttons
export default {
  components: {
    QuantityButtons
  },

  props: {
    item: { type: Object, required: true },
    mutable: { type: Boolean, default: true },
    max: { type: Number, required: true }
  },

  computed: {
    quantity: {
      get () {
        // TODO index state by model name or put prop on model
        const config = this.$store.state.gameSetup.elements || {}
        return config[this.item.id] || (this.item.configType === Boolean ? false : 0)
      },

      set (value) {
        this.$store.dispatch('gameSetup/setElementConfig', { id: this.item.id, config: value })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
