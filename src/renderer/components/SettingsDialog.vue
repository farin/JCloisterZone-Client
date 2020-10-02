<template>
  <v-card>
    <v-card-title class="headline">Settings</v-card-title>
    <v-card-text>
      <h3 class="mt-2 mb-4">Player</h3>

      <v-text-field
        v-model="nickname"
        label="Nickname"
      ></v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="secondary"
        text
        @click="$emit('close')"
      >Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>

export default {

  computed: {
    nickname: {
      get () { return this.$store.state.settings.nickname },
      set (val) { this.$store.dispatch('settings/update', { nickname: val })}
    }
  }
}

</script>

<style lang="sass" scoped>
</style>
