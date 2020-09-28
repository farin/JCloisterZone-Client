<template>
  <section
    :class="colorCssClass(action.player)"
  >
    <span class="text">{{ local ? 'Select follower for exchange' : 'Player must select follower for exchange' }} </span>
    <v-btn
      v-for="opt in options"
      :key="opt.id"
      large
      @click="exchange(opt.id)"
    >
      <Meeple :type="opt.type" />
    </v-btn>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

import Meeple from '@/components/game/Meeple'

export default {
  components: {
    Meeple
  },

  props: {
    action: { type: Object, required: true },
    local: { type: Boolean }
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass'
    }),

    options () {
      return this.action.items[0].options
    }
  },

  methods: {
    async exchange (meepleId) {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'EXCHANGE_FOLLOWER',
          payload: {
            meepleId
          }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.text
  font-size: 20px
  font-weight: 300
  margin-right: 20px

.v-btn
  margin: 0 10px

  svg
    width: 40px
    height: 40px
</style>
