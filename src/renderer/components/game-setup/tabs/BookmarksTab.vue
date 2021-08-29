<template>
  <div>
    <ConfigSection title="Saved setups">
      <a v-for="file in recentSetupSaves" :key="file" href="#" @click.prevent="loadSavedSetup(file)">{{ file }}</a>
      <!--a v-if="!recentGameSetups.length" class="clear" href="#" @click="clearSetups"><v-icon>fas fa-times</v-icon> clear list</a-->
    </ConfigSection>

    <ConfigSection title="Recently played">
    </ConfigSection>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ConfigSection from '@/components/game-setup/ConfigSection'

export default {
  components: {
    ConfigSection
  },

  data () {
    return {
    }
  },

  computed: {
    ...mapState({
      recentSetupSaves: state => state.settings.recentSetupSaves
    })
  },

  methods: {
    async loadSavedSetup (file) {
      try {
        await this.$store.dispatch('game/load', file)
        this.$emit('load')
      } catch {
        await this.$store.dispatch('settings/validateRecentSetupSaves')
      }
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
