<template>
  <OverviewTile
    enabled
    :z-index="zIndex"
  >
    <div v-if="expansion.name === '_UNKNOWN'" class="unknown">
      <v-icon>fas fa-exclamation-triangle</v-icon>
    </div>
    <ExpansionSymbol v-else :expansion="expansion" />

    <template #title>
      {{ expansionTitle(expansion.title, expansion.name.toLowerCase().replaceAll('_','-')) }}
    </template>
    <template #quantity>
      <div v-if="quantity !== 1 && expansion.name !== '_UNKNOWN'" class="quantity tile-set">
        {{ quantity === -1 ? '*' : quantity }}
      </div>
    </template>
  </OverviewTile>
</template>

<script>
import ExpansionSymbol from '@/components/ExpansionSymbol'
import OverviewTile from '@/components/game-setup/overview/OverviewTile'

export default {
  components: {
    ExpansionSymbol,
    OverviewTile
  },

  props: {
    expansion: { type: Object, required: true },
    lang: { type: String, required: false },
    title: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    zIndex: { type: Number, default: 1 }
  },
  
  methods: {
    expansionTitle (originalTitle, id) {
      const langId = ['expansion', id].join('.')
      if (this.$te(langId)) {
        return this.$t(langId)
      }
      return originalTitle
    }
  }
}
</script>

<style lang="sass" scoped>
.exp-symbol
  width: 70px
  height: 70px

.unknown .v-icon
  font-size: 54px

  +theme using ($theme)
    color: map-get($theme, 'removed-color')
</style>
