<template>
  <div>
    <h3 class="mt-2 mb-4">{{ $t('settings.player.title') }}</h3>

    <h4>{{ $t('settings.player.nickname') }}</h4>
    <em>{{ $t('settings.player.nickname-description') }}</em>
    <v-text-field
      v-model="nickname"
      outlined dense
      hide-details
    />

    <h4>{{ $t('settings.player.preferred-color') }}</h4>
    <em>{{ $t('settings.player.preferred-color-description') }}</em>
    <div class="preferred-color">
      <v-btn small :depressed="preferredColor !== null" @click="() => { preferredColor = null }">{{ $t('settings.player.none') }}</v-btn>
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
