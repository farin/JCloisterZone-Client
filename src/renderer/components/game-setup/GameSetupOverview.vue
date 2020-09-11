<template>
  <div class="game-setup-overview">
    <div
      v-for="{ expansion, set, quantity } in sets" :key="set.id"
      class="tile-set"
    >
      <span class="quantity">{{ quantity }}</span>
      <ExpansionSymbol :expansion="expansion" :size="36" />
      <span class="exp-title">{{ set.title }}</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ExpansionSymbol from '@/components/ExpansionSymbol'

export default {
  components: {
    ExpansionSymbol
  },

  computed: {
    ...mapGetters({
      sets: 'game/getTileSets'
    })
  }
}
</script>

<style lang="sass" scoped>
.tile-set
  border-radius: 7px
  padding: 5px 20px
  background: white
  display: inline-flex
  align-items: center

  .quantity, .exp-title
    font-size: 22px

  .exp-symbol
    margin: 0 10px

</style>
