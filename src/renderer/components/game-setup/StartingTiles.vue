<template>
  <div class="starting-tiles">
    <div class="items enabled">
      <div
        v-for="option in enabledOptions"
        :key="option.id"
        class="item"
        @click="select(option)"
      >
        <Miniboard
          :size="enabledTileSize(option.value.length)"
          :tiles="option.value"
        />
        <h3>{{ option.title }}</h3>
        <div class="checked">
          <v-icon v-if="selected.id == option.id">fas fa-check</v-icon>
        </div>
      </div>
    </div>
    <div class="disclaimer">
      {{ $t('game-setup.rules.starting-tiles-different-configuration') }}
    </div>
    <!-- <div class="items disabled">
      <div
        v-for="option in disabledOptions"
        :key="option.id"
        class="item"
      >
        <Miniboard
          :size="disabledTileSize(option.value.length)"
          :tiles="option.value"
        />
        <h3>{{ option.title }}</h3>
      </div>
    </div> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Miniboard from '@/components/game-setup/Miniboard'

export default {
  components: {
    Miniboard
  },

  computed: {
    ...mapGetters({
      options: 'gameSetup/startingTilesOptions',
      selected: 'gameSetup/selectedStartingTiles'
    }),

    enabledOptions () {
      return this.options.filter(o => o.enabled)
    },

    disabledOptions () {
      return this.options.filter(o => !o.enabled)
    }
  },

  methods: {
    enabledTileSize (len) {
      if (len === 1) {
        return 120
      }
      if (len === 2) {
        return 60
      }
      return 40
    },

    // disabledTileSize (len) {
    //   return this.enabledTileSize(len) / 2
    // },

    select (option) {
      if (this.selected.id !== option.id) {
        this.$store.commit('gameSetup/startingTiles', option.id)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.items
  margin-top: 20px
  display: flex
  justify-content: center
  flex-wrap: wrap

  .item
    margin: 10px
    padding: 40px
    padding-bottom: 22px
    text-align: center

    .miniboard
      margin-bottom: 20px

    .checked
      height: 26px

.items.enabled
  .item
    cursor: pointer

    +theme using ($theme)
      color: map-get($theme, 'cards-text')
      background: map-get($theme, 'cards-bg')

  .miniboard
    height: 120px

  h3
    font-size: 1.09em
    font-weight: 300
    margin-top: 16px
    margin-bottom: 20px

.items.disabled
  .miniboard
    height: 50px
    filter: grayscale(100%)

  h3
    font-size: 0.9em
    font-weight: 300
    margin-top: 16px
    margin-bottom: 20px

.disclaimer
  margin: 20px 0
  font-style: italic
  text-align: center
  font-size: 14px

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')
</style>
