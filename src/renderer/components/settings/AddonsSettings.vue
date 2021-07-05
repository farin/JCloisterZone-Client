<template>
  <div>
    <h3 class="mt-2 mb-4">Add-ons</h3>
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
