<template>
  <div>
    <h3 class="mt-2 mb-4">{{ $t('settings.apperance.title') }}</h3>

    <h4>{{ $t('settings.apperance.theme') }}</h4>
    <v-radio-group
      v-model="theme"
      dense hide-details
    >
      <v-radio
        :label="$t('settings.apperance.theme-light')"
        value="light"
      />
      <v-radio
        :label="$t('settings.apperance.theme-dark')"
        value="dark"
      />
    </v-radio-group>

    <h4>{{ $t('settings.apperance.artworks') }}</h4>
    <em>{{ $t('settings.apperance.artworks-description') }}</em>

    <div
      v-for="{ json: artwork } in artworks"
      :key="artwork.id"
      class="artwork-box"
      :class="{ disabled: !isArtworkEnabled(artwork.id) }"
    >
      <div class="artwork-icon">
        <img v-if="artwork.icon" :src="artwork.icon">
      </div>
      <div>
        <h5>{{ artwork.title }}</h5>
        <p>{{ artwork.description }}</p>
        <p v-if="artwork.artist" class="artist">{{ $t('settings.apperance.illustrated-by', [artwork.artist]) }}</p>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  computed: {
    theme: {
      get () { return this.$store.state.settings.theme },
      set (val) { this.$store.dispatch('settings/update', { theme: val }) }
    },

    artworks () {
      const artworks = []
      for (const addon of this.$addons.addons) {
        for (const artwork of addon.artworks) {
          artworks.push(artwork)
        }
      }
      return artworks
    }
  },

  methods: {
    isArtworkEnabled (id) {
      return this.$store.state.settings.enabledArtworks.includes(id)
    }
  }
}
</script>

<style lang="sass" scoped>
.artwork-box
  display: flex
  padding: 16px
  margin-top: 10px

  +theme using ($theme)
    background: map-get($theme, 'board-bg')

  h5
    font-size: 16px
    margin-bottom: 10px

  p
    margin-bottom: 2px

  .artwork-icon
    width: 90px
    height: 90px
    margin-right: 16px

    +theme using ($theme)
      background: map-get($theme, 'cards-bg')

    img
      object-fit: cover
      max-width: 100%

  &.disabled
    filter: grayscale(100%)

    p
      opacity: 0.75
</style>
