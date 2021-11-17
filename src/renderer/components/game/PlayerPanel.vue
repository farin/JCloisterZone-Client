<template>
  <section
    :class="{
      'active-turn': index === turnPlayer,
      'active-action': index === actionPlayer,
      'offline': !slot.sessionId
    }"
  >
    <div :class="'name-box '+ color">
      <div class="points">
        <div>{{ player.points }}</div>
      </div>
      <div class="name">
        <div>
          <span class="name-label">{{ player.name }}</span>
          <template v-if="!slot.sessionId">
            <br>
            <span class="offline-label">Offline</span>
          </template>
        </div>
      </div>
    </div>
    <PlayerClock v-if="timer" :player="index" />
    <div ref="resources" class="resources">
      <div
        v-for="({ follower, count }) in followers"
        :key="follower"
        :class="'item item-follower ' + color"
      >
        <Meeple :type="follower" />
        <span v-if="count > 1" class="count">{{ count }}</span>
      </div>

      <div
        v-for="({ token, count }) in tokens"
        :key="token"
        class="item item-token"
      >
        <TokenImage
          :token="token" :player="index"
        />
        <TokenImage
          v-if="count === 2 && !stackTwo(token)"
          class="stacked"
          :token="token" :player="index"
        />
        <span v-if="(count > 1 && stackTwo(token)) || count > 2" class="count">{{ count }}</span>
      </div>

      <div
        v-for="cap in player.captured"
        :key="cap.type + cap.player"
        :class="{
          item: true,
          'item-prisoner': true,
          [colorCssClass(cap.player)]: true,
          'can-pay': canPayRansom(cap.player)
        }"
        @click="payRansom(cap.player, cap.id)"
      >
        <Meeple :type="cap.type" />
        <span v-if="cap.count > 1" class="count">{{ cap.count }}</span>
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
import PlayerClock from '@/components/game/PlayerClock'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

import { FOLLOWER_ORDERING, TOKEN_ORDERING } from '@/constants/ordering'

export default {
  components: {
    Meeple,
    PlayerClock,
    StandaloneTileImage,
    TokenImage
  },

  props: {
    index: { type: Number, required: true },
    player: { type: Object, required: true }
  },

  computed: {
    ...mapState({
      timer: state => state.game.setup.timer,
      turnPlayer: state => state.game.turnPlayer,
      actionPlayer: state => state.game.action?.player,
      bazaar: state => state.game.bazaar
    }),

    ...mapGetters({
      colorCssClass: 'game/colorCssClass',
      canPayRansom: 'game/canPayRansom'
    }),

    color () {
      return this.colorCssClass(this.index)
    },

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
  margin-bottom: $panel-gap
  // min-height: 100px

  +theme using ($theme)
    background: map-get($theme, 'opaque-bg')

.name-box
  position: relative

  +theme using ($theme)
    background: map-get($theme, 'player-panel-name-bg')

.name
  display: flex
  justify-content: flex-start
  align-items: center
  word-wrap: none
  white-space: nowrap
  padding-left: 16px
  line-height: 1.2

  +theme using ($theme)
    color: map-get($theme, 'player-panel-name-color')

.offline-label
  text-transform: uppercase
  font-weight: 400
  letter-spacing: 0.9px

.active-turn
  .name-label
    text-decoration: underline dotted

.active-action
  .name-box
    +theme using ($theme)
      background: map-get($theme, 'player-panel-active-name-bg')

  .name-label
    text-decoration: underline solid

    +theme using ($theme)
      color: map-get($theme, 'player-panel-active-name-color')

.points
  position: absolute
  top: 0
  left: -25px
  display: flex
  align-items: center

  > div
    flex: 1
    text-align: right
    padding: 0 18px
    font-weight: 500

.resources
  display: flex
  flex-wrap: wrap

  span.count
    display: inline-flex
    justify-content: center
    align-items: center
    font-weight: bold
    font-size: 20px
    line-height: 30px
    width: 30px
    height: 30px
    border-radius: 14px
    position: relative
    z-index: 1

    +theme using ($theme)
      background: map-get($theme, 'player-panel-count-bg')
      color: map-get($theme, 'player-panel-count-text')

  .item-follower, .item-prisoner
    margin: 0 2px

    svg
      position: relative
      z-index: 2

  .item-token
    margin: 0 2px

    .token-image
      position: relative
      z-index: 2

    .stacked
      margin-left: -24px

    ::v-deep svg:not(.tunnel)
      +theme using ($theme)
        fill: map-get($theme, 'cards-text')

  .item-prisoner.can-pay:hover
    cursor: pointer
    border-radius: 4px

    +theme using ($theme)
      background: map-get($theme, 'removed-color')

aside.shrink-0
  section
    padding-top: 15px

  .name-box, .name, .points
    height: 60px

  .name
    font-size: 18px
    margin-left: 65px

    .offline-label
      font-size: 14px

  .points
    border-radius: 30px
    width: 90px

    > div
      font-size: 36px

  .resources
    padding: 15px

    .item-follower svg, .item-prisoner svg, .item-token .token-image, .bazaar-tile svg
      width: 34px
      height: 34px

    span.count
      left: -8px
      top: -10px
      margin-right: -6px

aside.shrink-1
  section
    padding-top: 10px

  .name-box, .name, .points
    height: 50px

  .name
    font-size: 16px
    margin-left: 55px

    .offline-label
      font-size: 13px

  .points
    border-radius: 25px
    width: 80px

    > div
      font-size: 31px

  .resources
    padding: 12px 10px 6px

    .item-follower svg, .item-prisoner svg, .item-token .token-image, .bazaar-tile svg
      width: 26px
      height: 26px

    span.count
      transform: scale(0.765)
      left: -11px
      top: -6px
      margin-right: -14px

aside.shrink-2, aside.shrink-3
  section
    padding-top: 5px

  .name-box, .name, .points
    height: 40px

  .name
    font-size: 14px
    margin-left: 45px

    .offline-label
      font-size: 11px

  .points
    border-radius: 20px
    width: 70px

    > div
      font-size: 26px

  .item
    height: 28px

  .resources
    padding: 9px 6px 3px

    .item-follower svg, .item-prisoner svg, .item-token .token-image, .bazaar-tile svg
      width: 20px
      height: 20px

    span.count
      transform: scale(0.588)
      left: -12px
      top: -4px
      margin-right: -18px

aside.shrink-3
  section
    margin-bottom: 2px

  .name-box
    display: inline-block
    float: left

  .name
    display: none

  .points
    height: 28px
    width: 50px
    border-radius: 14px
    margin-top: -1px

    > div
      font-size: 20px

  .item
    height: 26px

  .resources
    padding: 3px 2px 3px 6px

    .item:first-child
      padding-left: 25px
</style>
