<template>
  <section>
    <span class="text">Choose one. Each player</span>
    <v-btn large color="secondary" @click="select('DEPLOY')">may deploy</v-btn>
    <span class="text">or</span>
    <v-btn large color="secondary" @click="select('REMOVE')">must remove</v-btn>
    <span class="text">meeple on/from {{ featureName }}.</span>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  components: {
  },

  props: {
    action: { type: Object, required: true }
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
      if (featureType === 'City') return 'a city'
      if (featureType === 'Farm') return 'a field'
      if (featureType === 'Road') return 'a road'
      return featureType
    }
  },

  methods: {
    async select (value) {
      await this.$store.dispatch('game/apply', {
        type: 'CIRCLE_REMOVE_OR_DEPLOY',
        payload: { value }
      })
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
