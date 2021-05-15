<template>
  <QuantityButtons
    v-model="quantity"
    :max="max || 3"
    :mutable="mutable"
  >
    <slot/>
  </QuantityButtons>
</template>

<script>
import isNil from 'lodash/isNil'

import QuantityButtons from '@/components/game-setup/buttons/QuantityButtons'

const DEFAULT_MAX = 3

export default {
  components: {
    QuantityButtons
  },

  props: {
    sets: { type: Array, required: true },
    mutable: { type: Boolean, default: true }
  },

  computed: {
    max () {
      let mx = DEFAULT_MAX
      this.sets.forEach(s => {
        if (!isNil(s.max)) {
          mx = Math.min(mx, s.max)
        }
      })
      return mx
    },

    quantity: {
      get () {
        const sets = this.$store.state.gameSetup.sets || {}
        return sets[this.sets[0]] || 0
      },

      set (value) {
        this.sets.forEach(id => {
          this.$store.dispatch('gameSetup/setTileSetQuantity', { id, quantity: value })
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
