<template>
  <section
    :class="{
      'active-turn': index === turnPlayer,
      'active-action': index === actionPlayer,
    }"
  >
    <div :class="'name-box ' + colorCssClass(index)">
      <div class="points">
        <div>{{ player.points }}</div>
      </div>
      <div class="name">{{ player.name }}</div>
    </div>
    <div v-if="!slot.sessionId" class="disconnected">
      <!--v-icon>fas fa-exclamation</v-icon-->Disconnected
    </div>
    <div class="resources">
      <div class="followers">
        <div
          v-for="({ follower, count }) in followers"
          :key="follower"
          :class="'item ' + colorCssClass(index)"
        >
          <Meeple :type="follower" />
          <span v-if="count > 1" class="count">{{ count }}</span>
        </div>
      </div>
      <div class="tokens">
        <div
          v-for="({ token, count }) in tokens"
          :key="token"
          class="item"
        >
          <TokenImage
            :token="token" :player="index" :height="34"
          />
          <TokenImage
            v-if="count === 2 && !stackTwo(token)"
            class="stacked"
            :token="token" :player="index" :height="34"
          />
          <span v-if="(count > 1 && stackTwo(token)) || count > 2" class="count">{{ count }}</span>
        </div>
      </div>
      <div
        v-if="player.captured"
        class="prisoners"
      >
        <div
          v-for="cap in player.captured"
          :key="cap.type + cap.player"
          :class="{
            item: true,
            [colorCssClass(cap.player)]: true,
            'can-pay': canPayRansom(cap.player)
          }"
          @click="payRansom(cap.player, cap.id)"
        >
          <Meeple :type="cap.type" />
          <span v-if="cap.count > 1" class="count">{{ cap.count }}</span>
        </div>
      </div>
      <div v-if="auctionedTile" class="bazaar-tile">
        <StandaloneTileImage :tile-id="auctionedTile" />
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import Meeple from '@/components/game/Meeple'
import TokenImage from '@/components/game/TokenImage'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

import { FOLLOWER_ORDERING, TOKEN_ORDERING } from '@/constants/ordering'

export default {
  components: {
    Meeple,
    StandaloneTileImage,
    TokenImage
  },

  props: {
    index: { type: Number, required: true },
    player: { type: Object, required: true }
  },

  computed: {
    ...mapState({
      turnPlayer: state => state.game.turnPlayer,
      actionPlayer: state => state.game.action ? state.game.action.player : null,
      bazaar: state => state.game.bazaar
    }),

    ...mapGetters({
      colorCssClass: 'game/colorCssClass',
      canPayRansom: 'game/canPayRansom'
    }),

    slot () {
      return this.$store.state.game.slots.find(s => s.number === this.player.slot)
    },

    followers () {
      const followers = Object.entries(this.player.meeples).map(([follower, [count]]) => {
        return { follower, count, ordering: FOLLOWER_ORDERING[follower] }
      })
      followers.sort((a, b) => a.ordering - b.ordering)
      return followers
    },

    tokens () {
      const tokens = Object.entries(this.player.tokens).map(([token, count]) => {
        return { token, count, ordering: TOKEN_ORDERING[token] }
      })
      tokens.sort((a, b) => a.ordering - b.ordering)
      return tokens
    },

    auctionedTile () {
      if (!this.bazaar) return null
      const bi = this.bazaar.find(bi => bi.owner === this.index)
      return bi ? bi.tile : null
    }
  },

  methods: {
    async payRansom (owner, meepleId) {
      if (this.canPayRansom(owner)) {
        await this.$store.dispatch('game/apply', {
          type: 'PAY_RANSOM',
          payload: {
            meepleId
          }
        })
      }
    },

    stackTwo (token) {
      return !token.startsWith('TUNNEL_')
    }
  }
}
</script>

<style lang="sass" scoped>
section
  margin-top: $panel-gap
  padding-top: 15px
  min-height: 100px

  +theme using ($theme)
    background: map-get($theme, 'opaque-bg')

.name-box
  position: relative
  //margin-top: 20px
  height: 60px
  background: #f0f0f0

.name
  //margin-top: 30px // + 10 for outer box margin
  padding-left: 65px
  padding-top: 5px
  font-size: 32px
  color: #aaa
  text-align: center

.disconnected
  text-transform: uppercase
  text-align: center
  padding: 12px 0
  font-weight: 500
  background: #FFECB3

.active-turn
  .name
    color: #757575

.active-action
  .name
    text-decoration: underline

.points
  position: absolute
  top: 0
  left: -25px
  width: 90px
  height: 60px
  display: flex
  align-items: center
  border-radius: 30px

  > div
    flex: 1
    text-align: right
    padding: 0 18px
    font-weight: 500
    font-size: 36px

.resources
  padding: 15px

.followers, .tokens, .prisoners
  display: flex
  flex-wrap: wrap

  span.count
    display: inline-flex
    justify-content: center
    align-items: center
    font-weight: bold
    font-size: 20px
    line-height: 30px
    background: #e0e0e0
    color: black
    width: 30px
    height: 30px
    border-radius: 14px
    position: relative
    left: -8px
    top: -10px
    z-index: 1
    margin-right: -6px

.followers, .prisoners
  .item
    margin: 0 2px

    svg
      width: 34px
      height: 34px
      position: relative
      z-index: 2

.tokens
  .item
    margin: 0 2px

    .token-image
      position: relative
      z-index: 2

    .stacked
      margin-left: -24px

.prisoners .item.can-pay:hover
  background: $removed-color
  cursor: pointer
  border-radius: 4px

.bazaar-tile
  svg
    width: 34px
    height: 34px
</style>
