<template>
  <div class="expr-item" :class="{'has-count': hasCount}">
    <div class="icon">
      <span v-if="hasCount" class="count">{{ item.count }}&times;</span>
      <template v-if="item.name === 'tiles'"><v-icon title="Tiles">fas fa-square</v-icon></template>
      <template v-else-if="item.name === 'pennants'"><img title="Coat of arms" src="~/assets/icons/shield.png" height="40"></template>
      <template v-else-if="item.name === 'inn'"><img title="Inn" src="~/assets/features/C1/inn.png" height="40"></template>
      <template v-else-if="item.name === 'fairy'"><NeutralFigure figure="fairy" :width="40" :height="40" /></template>
      <template v-else><v-icon title="Unknown bonus">fas fa-question</v-icon></template>
    </div>
    <div class="points">{{ points }}</div>
  </div>
</template>

<script>
import { Expansion } from '@/models/expansions'
import NeutralFigure from '@/components/game/NeutralFigure'
import isNil from 'lodash/isNil'

export default {
  components: {
    NeutralFigure
  },

  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true }
  },

  data () {
    return {
      Expansion
    }
  },

  computed: {
    hasCount () {
      return !isNil(this.item.count)
    },

    points () {
      const { points } = this.item
      if (points > 0) {
        return '+' + points
      }
      return points + ''
    }
  }
}
</script>

<style lang="sass" scoped>
.expr-item
  width: 60px
  text-align: center
  margin-right: 20px

  .count
    font-size: 20px
    font-weight: 300

  .icon
    height: 40px
    line-height: 40px
    display: flex
    align-items: center
    justify-content: center

    .v-icon
      font-size: 40px

  .points
    font-size: 22px
    font-weight: 400
    margin-top: 4px
    padding-top: 2px
    border-top: 1px solid #ccc

  &.has-count
    width: 80px
    .count
      margin-right: 6px
    .icon
      margin-left: 6px

    //+theme using ($theme)
      //color: map-get($theme, 'text-color')
  // .expr
  //   display: flex
  //   align-items: stretch
  //   font-size: 28px
  //   font-weight: 500
  //   padding-top: 1px

  //   +theme using ($theme)
  //     color: map-get($theme, 'gray-text-color')

</style>
