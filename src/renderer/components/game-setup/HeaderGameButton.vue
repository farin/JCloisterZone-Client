<template>
  <div class="header-game-button">
    <v-btn :large="$vuetify.breakpoint.height > 768" color="primary" :disabled="!engine || !engine.ok || !containsCoreSet || disabled" @click="ev => $emit('click', ev)">
      <v-icon left>fas fa-play</v-icon>
      {{ title }}
    </v-btn>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    title: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    sets: { type: Object, required: true }
  },

  computed: {
    ...mapState({
      java: state => state.java,
      engine: state => state.engine
    }),

    containsCoreSet () {
      return this.sets.basic || this.sets['basic:1'] || this.sets['basic:2'] ||
        this.sets.winter || this.sets['winter:1'] || this.sets['winter:2']
    }
  }
}
</script>

<style lang="sass" scoped>
.header-game-button
  display: flex
  align-items: center
</style>
