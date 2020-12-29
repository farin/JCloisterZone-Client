<template>
  <v-card>
    <v-card-title class="headline">
      Tiles
    </v-card-title>
    <v-card-text>
      <TileDistributionLive :sets="sets" :rules="rules" />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        text
        @click="$emit('close')"
      >Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

import TileDistributionLive from '@/components/game/dialogs/TileDistributionLive'

export default {
  components: {
    TileDistributionLive
  },

  props: {
  },

  computed: {
    ...mapState({
      sets: state => state.game.setup?.sets,
      rules: state => state.game.setup?.rules,
    })
  }
}

</script>

<style lang="sass" scoped>

</style>
