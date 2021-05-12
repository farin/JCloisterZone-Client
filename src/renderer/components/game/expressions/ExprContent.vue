<template>
  <section>
    <div class="expr-title">
      <slot name="title" />
    </div>
    <div class="expr-row">
      <div class="expr">
        <slot name="row" />
      </div>
      <div
        :class="'points ' + colorCssClass(expr.player)"
      >
        {{ expr.points }}
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    expr: { type: Object, required: true }
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass'
    })
  }
}
</script>

<style lang="sass" scoped>
.expr-row
  display: flex
  align-items: stretch
  height: 100%

  justify-content: center

  .points
    width: 69px
    height: 46px
    text-align: center
    border-radius: 23px
    font-size: 28px
    font-weight: 500

  .expr
    display: flex
    align-items: stretch
    font-size: 28px
    font-weight: 500
    padding-top: 1px

    +theme using ($theme)
      color: map-get($theme, 'gray-text-color')

    .value-units
      position: relative
      display: flex
      flex-direction: column
      align-items: center
      text-align: center
      padding: 0 10px
      margin: 0 2px

      +theme using ($theme)
        background: map-get($theme, 'expr-units-bg')
        color: map-get($theme, 'expr-units-text')

      i
        margin-top: 5px

        +theme using ($theme)
          color: map-get($theme, 'gray-text-color')

      img
        position: absolute
        height: 32px
        top: 45px

    .value-units.nobg
      background: none

.expr-title
  position: absolute
  left: 0
  max-width: 210px
  height: var(--action-bar-height)
  line-height: 1
  display: flex
  align-items: center
  padding-left: 20px
  font-size: 20px
  font-weight: 300
</style>
