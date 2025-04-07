<template>
  <div class="online-status">
    <span class="text">{{ $t('index.online.connected-to', [playOnlineHostname]) }}</span>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      playOnlineHostname: state => state.settings.playOnlineUrl.split('/')[0]
    })
  }
}
</script>

<style lang="sass" scoped>
.online-status
  text-align: center
  font-size: 16px
  font-weight: 300

  +theme using ($theme)
    background-color: map-get($theme, 'cards-bg')
    color: map-get($theme, 'gray-text-color')
</style>
