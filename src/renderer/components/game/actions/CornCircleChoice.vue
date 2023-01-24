<template>
  <section>
    <template v-if="local">
      <i18n tag="span" path="game.action.crop-circles-choose-one" class="text">
        <template #deploy>
          <v-btn large color="secondary" @click="select('DEPLOY')">{{ $t('button.may-deploy') }}</v-btn>
        </template>
        <template #remove>
          <v-btn large color="secondary" @click="select('REMOVE')">{{ $t('button.must-remove') }}</v-btn>
        </template>
        <template #feature>
          {{ featureName }}
        </template>
      </i18n>
    </template>
    <span v-else class="text">{{ $t('game.action.crop-circles-player-must-choose', { feature: featureName } ) }}</span>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  components: {
  },

  props: {
    action: { type: Object, required: true },
    local: { type: Boolean }
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass'
    }),

    actionItem () {
      return this.action.items[0]
    },

    featureName () {
      const { featureType } = this.actionItem
      if (featureType === 'Farm') featureType = 'field'
      return this.$t(['game.feature',featureType.toLowerCase()].join('.'))
    }
  },

  methods: {
    async select (value) {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'CIRCLE_REMOVE_OR_DEPLOY',
          payload: { value }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.text
  font-size: 20px
  font-weight: 300

.v-btn
  margin: 0 10px
</style>
