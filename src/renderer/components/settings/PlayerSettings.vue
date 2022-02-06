<template>
  <div>
    <h3 class="mt-2 mb-4">Player</h3>

    <h4>Nickname</h4>
    <em>Nickname used when player is assigned to a game.</em>
    <v-text-field
      v-model="nickname"
      outlined dense
      hide-details
    />

    <h4>Preferred Color</h4>
    <em>Automatically take a color after game join.</em>
    <div class="preferred-color">
      <v-btn small :depressed="preferredColor !== null" @click="() => { preferredColor = null }">None</v-btn>
      <v-btn
        v-for="(n, i) in 9"
        :key="i"
        :class="`color color-${i} color-bg-important color-overlay`"
        small
        :depressed="preferredColor !== i "
        @click="() => { preferredColor = i }"
      >
        <template v-if="preferredColor === i">x</template>
      </v-btn>
    </div>
  </div>
</template>

<script>

export default {
  computed: {
    nickname: {
      get () { return this.$store.state.settings.nickname },
      set (val) { this.$store.dispatch('settings/update', { nickname: val }) }
    },

    preferredColor: {
      get () { return this.$store.state.settings.preferredColor },
      set (val) { this.$store.dispatch('settings/update', { preferredColor: val }) }
    }
  }
}
</script>

<style lang="sass" scoped>
.preferred-color
  display: flex

  .v-btn
    margin-right: 3px

    &.color
      padding: 0 !important
      min-width: 30px !important
</style>
