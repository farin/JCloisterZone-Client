<template>
  <div class="time-input">
    <input
      v-model="minutes"
      size="2"
      maxlength="2"
      @change="onChange"
    >
    :
    <input
      v-model="seconds"
      size="2"
      maxlength="2"
      @change="onChange"
    >
  </div>
</template>

<script>

function pad (v) {
  if (v < 10) return `0${v}`
  return '' + v
}

export default {
  props: {
    value: { type: Number, required: true }
  },

  data () {
    return {
      minutes: this.value === null ? '00' : pad(parseInt(this.value / 60)),
      seconds: this.value === null ? '00' : pad(this.value % 60)
    }
  },

  methods: {
    onChange () {
      const m = parseInt(this.minutes)
      const s = parseInt(this.seconds)
      if (!Number.isNaN(m) && !Number.isNaN(s)) {
        this.$emit('input', m * 60 + s)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.time-input
  display: inline-block
  font-size: 36px
  font-weight: 500
  padding: 5px 7px
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.07), 0 3px 10px 0 rgba(0, 0, 0, 0.05)

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')
    background: map-get($theme, 'cards-bg')

  input
    width: 50px
    margin: 0 5px
    // border: 1px solid gray
    text-align: center

    +theme using ($theme)
      color: map-get($theme, 'gray-text-color')
</style>
