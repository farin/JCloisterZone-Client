<template>
  <div>
    <ConfigSection title="My Setups">
      <div class="recent-list setup-list d-flex flex-column align-end">
        <div
          v-for="({ setup, valid, idx, hash }) in verifiedMySetups"
          :key="hash"
          class="recent-setup"
          :class="{ invalid: !valid }"
          @click="valid && loadSetup(setup)"
          @contextmenu="showRecentSetup($event, idx)"
        >
          <GameSetupOverviewInline :sets="setup.sets" :elements="setup.elements" />
        </div>
        <!--a class="clear" href="#" @click="clearSetups"><v-icon>fas fa-times</v-icon> clear list</a-->
      </div>
    </ConfigSection>

    <ConfigSection title="Saved setups">
      <a v-for="file in recentSetupSaves" :key="file" href="#" @click.prevent="loadSavedSetup(file)">{{ file }}</a>
      <!--a v-if="!recentGameSetups.length" class="clear" href="#" @click="clearSetups"><v-icon>fas fa-times</v-icon> clear list</a-->
    </ConfigSection>

    <ConfigSection title="Last game">
    </ConfigSection>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import { cyrb53 } from '@/utils/hash'
import ConfigSection from '@/components/game-setup/ConfigSection'
import GameSetupOverviewInline from '@/components/game-setup/overview/GameSetupOverviewInline'

export default {
  components: {
    ConfigSection,
    GameSetupOverviewInline
  },

  data () {
    return {
      verifiedMySetups: []
    }
  },

  computed: {
    ...mapState({
      mySetups: state => state.settings.mySetups,
      recentSetupSaves: state => state.settings.recentSetupSaves
    })
  },

  mounted () {
    this.verifyMySetups()
  },

  methods: {
    async loadSavedSetup (file) {
      try {
        await this.$store.dispatch('game/load', file)
        this.$emit('load')
      } catch {
        await this.$store.dispatch('settings/validateRecentSetupSaves')
      }
    },

    verifyMySetups () {
      this.verifiedMySetups = this.mySetups.map((setup, idx) => {
        const edition = setup.elements.garden ? 2 : 1
        const valid = !this.$tiles.getExpansions(setup.sets, edition)._UNKNOWN
        // put valid to status to hash, to force render on change
        return { setup, valid, idx, hash: `${cyrb53(JSON.stringify(setup))}-${~~valid}` }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.recent-setup
  cursor: pointer
  padding-top: 5px
  margin-bottom: 20px
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.10), 0 3px 10px 0 rgba(0, 0, 0, 0.03)

  +theme using ($theme)
    border: 1px solid #{map-get($theme, 'line-color')}

  &.invalid
    cursor: default
    opacity: 0.4
</style>
