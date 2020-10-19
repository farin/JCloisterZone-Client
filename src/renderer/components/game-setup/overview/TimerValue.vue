<template>
  <div>
    {{ minutes }}&thinsp;:&thinsp;{{ seconds }}
  </div>
</template>

<script>
export default {
  props: {
    value: { type: Number, required: true }
  },

  computed: {
    minutes () {
      return parseInt(this.value / 60);
    },

    seconds () {
      const s = this.value % 60
      return `${s < 10 ? '0' : ''}${s}`
    }
  },
}
</script>

<style lang="sass" scoped>
div
  display: inline-block
</style>
