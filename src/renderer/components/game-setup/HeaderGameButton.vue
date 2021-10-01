<template>
  <div class="header-game-button">
    <div v-if="java && java.error === 'not-found'" class="warning-text">
      Java is not installed!
    </div>
    <div v-else-if="java && java.error === 'outdated'" class="warning-text">
      Java is outdated!
    </div>
    <div v-else-if="engine && engine.error" class="warning-text">
      Game engine not available.
    </div>
    <div v-else-if="!containsCoreSet" class="info-text">
      No core set!
    </div>
    <div v-else-if="info" class="info-text">
      {{ info }}
    </div>

    <v-btn :large="$vuetify.breakpoint.height > 768" color="primary" :disabled="!engine || !engine.ok || !containsCoreSet || !!info" @click="ev => $emit('click', ev)">
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
    info: { type: String, default: null },
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

.warning-text, .info-text
  font-size: 24px
  white-space: nowrap
  color: white
  margin-right: 20px
  padding: 0 10px
  border-radius: 4px

.warning-text
  background-color: #F44336

.info-text
  background-color: #3F51B5
</style>
