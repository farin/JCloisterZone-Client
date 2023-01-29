<template>
  <section>
    <div>
      <div class="text">{{ $t('game.action.hills-and-sheep-shepherd-fields-was-expanded') }}</div>
      <div class="help flock-content">
        <Meeple
          v-for="flock in flocks"
          :key="flock.id"
          type="Shepherd"
          :class="colorCssClass(flock.player)"
        />
        <span
          v-for="flock in flocks"
          :key="flock.id + '-tokens'"
        >
          <TokenImage
            v-for="(token, idx) in flock.tokens"
            :key="idx"
            :token="token"
            :height="$vuetify.breakpoint.height > 768 ? 30 : 20"
          />
        </span>
      </div>
    </div>
    <template v-if="local">
      <div>
        <div class="text">{{ $t('core-messages.choose') }}</div>
        <div class="help">&nbsp;</div>
      </div>
      <div>
        <v-btn color="secondary" @click="grow">{{ $t('button.grow-the-flock') }}</v-btn>
        <div class="help">{{ $tc('game.action.hills-and-sheep-tokens-left-plural', sheep.bagSize, { tokens: sheep.bagSize } ) }}</div>
      </div>
      <div>
        <div class="text">{{ $t('game.action.or') }}</div>
        <div class="help">&nbsp;</div>
      </div>
      <div>
        <v-btn color="secondary" @click="score">{{ $t('button.score-the-sheep') }}</v-btn>
        <div class="help">{{ $tc('game.action.hills-and-receive-points-plural', points, { points: points } ) }}</div>
      </div>
    </template>
    <div v-else class="text">
      {{ $tc('game.action.hills-and-player-must-choose-grow-or-score-plural', points, { points: points }) }}
    </div>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import { isSameFeature, getMeeplePlayer } from '@/utils/gameUtils'
import Meeple from '@/components/game/Meeple'
import TokenImage from '@/components/game/TokenImage'

export default {
  components: {
    Meeple,
    TokenImage
  },

  props: {
    action: { type: Object, required: true },
    local: { type: Boolean }
  },

  computed: {
    ...mapState({
      sheep: state => state.game.sheep,
      shepherds: state => state.game.deployedMeeples.filter(m => m.type === 'Shepherd')
    }),

    ...mapGetters({
      colorCssClass: 'game/colorCssClass',
      featureOn: 'game/featureOn'
    }),

    actionItem () {
      return this.action.items[0]
    },

    flocks () {
      const { places } = this.featureOn(this.actionItem)
      const shepherds = []
      places.forEach(([x, y, loc]) => {
        const shepherdOnFeature = this.shepherds.find(s => s.location === loc && s.position[0] === x && s.position[1] === y)
        if (shepherdOnFeature) {
          shepherds.push(shepherdOnFeature)
        }
      })
      return shepherds.map(s => {
        return {
          id: s.id,
          player: getMeeplePlayer(s.id),
          position: s.position,
          location: s.location,
          tokens: this.sheep.flocks.find(f => isSameFeature(f, s)).tokens
        }
      })
    },

    points () {
      let points = 0
      this.flocks.forEach(f => f.tokens.forEach(t => {
        points += parseInt(t.replace('SHEEP_', '').replace('X', ''))
      }))
      return points
    }
  },

  methods: {
    async grow () {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'FLOCK_EXPAND_OR_SCORE',
          payload: {
            value: 'EXPAND'
          }
        })
      }
    },

    async score () {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'FLOCK_EXPAND_OR_SCORE',
          payload: {
            value: 'SCORE'
          }
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

.help
  text-align: center
  margin-top: 10px
  font-size: 14px
  height: 30px

section > div
  margin: 0 10px

.flock-content
  .meeple
    width: 30px
    height: 30px
</style>
