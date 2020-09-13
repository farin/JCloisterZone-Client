<template>
  <div
    :class="{
      'exp-box': true,
      [expansion.name]: true,
      'selected': selected,
      'multiset': expansion.sets.length > 1,
      ['multiset-' + expansion.sets.length]: expansion.sets.length > 1
    }"
  >
    <div class="exp-title" @click="open">
      <ExpansionSymbol :expansion="expansion" />
      <h3>{{ expansion.title }}</h3>
    </div>
    <div class="exp-controls">
      <template v-if="expansion.sets.length === 1">
        <TileSetButtons :set="expansion.sets[0]" />
      </template>
      <template v-else>
        <div
          v-for="set in expansion.sets"
          :key="set.id"
          class="tile-set-row"
        >
          <h4 :title="set.note">{{ set.title }}</h4>
          <TileSetButtons :set="set" />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ExpansionSymbol from '@/components/ExpansionSymbol'
import TileSetButtons from '@/components/game-setup/buttons/TileSetButtons'

export default {
  components: {
    ExpansionSymbol,
    TileSetButtons
  },

  props: {
    expansion: { type: Object, required: true }
  },

  computed: {
    ...mapState({
      sets: state => state.gameSetup.sets || {}
    }),

    selected () {
      return this.expansion.sets.reduce((acc, set) => acc || !!this.sets[set.id], false)
    }
  },

  methods: {
    open () {
      this.$store.commit('gameSetup/detail', { view: 'expansion', expansion: this.expansion })
    }
  }
}
</script>

<style lang="sass" scoped>
.exp-box
  display: flex
  flex-direction: column
  background: white

  .exp-title
    cursor: help
    text-align: center
    padding: 24px 0 8px 0

    h3
      font-size: 1.09em
      font-weight: 300
      margin-top: 16px

    .exp-symbol
      display: block
      margin: 0 auto

  .exp-controls
    flex: 1
    display: flex
    flex-direction: column
    justify-content: center
    border-top: 1px solid #ddd

  &.selected
    background: $selection-bg
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15), 0 3px 10px 0 rgba(0, 0, 0, 0.10)

    h3
      color: $selection-icon

    .exp-title svg
        fill: $selection-icon

.tile-set-row
  text-align: center

  &:first-child
    margin-top: 10px

  h4
    font-weight: 400

.exp-box.multiset-3
  .tile-set-row
    .tile-set-buttons
      height: 48px

</style>