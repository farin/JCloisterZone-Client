<template>
  <div class="addon-box">
    <h5>{{ addon.id }}</h5>

    <div class="expansions">
      <div
        v-for="exp in addon.expansions"
        :key="exp.id"
      >
        <ExpansionSymbol :expansion="exp" />
      </div>
    </div>
  </div>
</template>

<script>
import ExpansionSymbol from '@/components/ExpansionSymbol'

export default {
  components: {
    ExpansionSymbol
  },

  props: {
    addon: { type: Object, required: true }
  },

  computed: {
  }
}
</script>

<style lang="sass" scoped>
.addon-box
  //display: flex
  padding: 16px
  margin-top: 20px

  +theme using ($theme)
    background: map-get($theme, 'board-bg')

h5
  margin-bottom: 10px

.expansions
  > div
    width: 40px
    height: 40px
</style>
