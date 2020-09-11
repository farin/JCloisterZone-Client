<template>
  <v-chip
    class="ma-2"
    :color="color"
    label
    text-color="white"
    :title="href"
    @click.prevent="open"
  >
    <v-icon v-if="site === 'wica'" left>fab fa-wikipedia-w</v-icon>
    <template v-else-if="site === 'bgg'">
      <img src="~/assets/bgg.svg" width="60" height="29">&nbsp;
    </template>
    {{ title }}
  </v-chip>
</template>

<script>
import { shell } from 'electron'

export default {
  props: {
    title: { type: String, default: null },
    href: { type: String, required: true }
  },

  computed: {
    site () {
      if (this.href.startsWith('http://wikicarpedia.com')) {
        return 'wica'
      }
      if (this.href.startsWith('https://boardgamegeek.com')) {
        return 'bgg'
      }
      return ''
    },

    color () {
      if (this.site === 'bgg') {
        return '#3f3a60'
      }
      return 'pink lighten-1'
    }
  },

  methods: {
    open () {
      shell.openExternal(this.href)
    }
  }
}
</script>
