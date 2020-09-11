<template>
  <div class="exchange-event">
    <v-icon>fas fa-exchange-alt</v-icon>
    <div class="one-square">
      <Meeple
        :type="ev.exchange[0].type"
        :class="colorCssClass(ev.exchange[0].player)"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Meeple from '@/components/game/Meeple'

export default {
  components: {
    Meeple
  },

  props: {
    ev: { type: Object, required: true }
  },

  computed: mapGetters({
    colorCssClass: 'game/colorCssClass'
  })
}
</script>

<style lang="sass" scoped>
.exchange-event
  width: 80px
  display: flex

  .v-icon
    width: 40px
</style>
