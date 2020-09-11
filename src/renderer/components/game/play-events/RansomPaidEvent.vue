<template>
  <div title="Ransom paid">
    <div :class="'points ' + colorCssClass(ev.prisoner)">-3</div>
    <div :class="'points ' + colorCssClass(ev.jailer)">+3</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    ev: { type: Object, required: true }
  },

  computed: mapGetters({
    colorCssClass: 'game/colorCssClass'
  })
}
</script>

<style lang="sass" scoped>
.points
  width: 30px
  height: 20px
  text-align: center
  font-size: 14px
  border-radius: 10px
</style>
