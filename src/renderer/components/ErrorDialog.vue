<template>
  <v-card class="about">
    <v-card-title />
    <v-card-text>
      <v-alert type="error">
        {{ msg.title }}
      </v-alert>
      {{ msg.content }}
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        text
        @click="$emit('close')"
      >
        {{ $t('button.close') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    msg: { type: Object, required: true }
  }
}
</script>

<style lang="sass" scoped>
</style>
