<template>
  <section class="config-section">
    <div class="label">
      <h2>{{ title }}</h2>
    </div>
    <slot />
  </section>
</template>

<script>
export default {

  props: {
    title: { type: String, default: '' }
  }
}
</script>

<style lang="sass" scoped>
.config-section
  margin-top: $panel-gap * 2
  padding: 0 $panel-gap

  .label
    text-align: center

    h2
      color: $color-gray
      font-weight: 300
      font-size: 16px
      text-transform: uppercase
</style>
