<template>
  <v-text-field
    single-line
    dense
    type="number"
    :value="value"
    @input="input"
  />
</template>

<script>
export default {
  props: {
    value: { type: Number, default: 0 },
    min: { type: Number, default: null },
    max: { type: Number, default: null }
  },

  watch: {
    min () { this.setInputAttrs() },
    max () { this.setInputAttrs() }
  },

  mounted () {
    this.setInputAttrs()
  },

  methods: {
    input (value) {
      this.$emit('input', parseInt(value))
    },

    setInputAttrs () {
      const input = this.$el.querySelector('input')
      if (this.min !== null) {
        input.min = this.min
      }
      if (this.max !== null) {
        input.max = this.max
      }
    }

  }
}
</script>
