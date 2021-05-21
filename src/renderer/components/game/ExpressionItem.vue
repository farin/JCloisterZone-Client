<template>
  <div class="expr-item">
    <div>{{ item.count }} {{ item.name }}</div>
    <div class="points">{{ item.points }}</div>
  </div>
</template>

<script>
import { Expansion } from '@/models/expansions'

export default {
  props: {
    item: { type: Object, required: true }
  },

  data () {
    return {
      Expansion
    }
  },

  computed: {
  }
}
</script>

<style lang="sass" scoped>
.exp-item
  // .expr
  //   display: flex
  //   align-items: stretch
  //   font-size: 28px
  //   font-weight: 500
  //   padding-top: 1px

  //   +theme using ($theme)
  //     color: map-get($theme, 'gray-text-color')

</style>
