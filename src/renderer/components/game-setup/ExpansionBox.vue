<template>
  <div
    :class="{
      'exp-box': true,
      [expansion.name]: true,
      'selected': selected,
      'multiset': expansion.releases.length > 1,
      ['multiset-' + expansion.releases.length]: expansion.releases.length > 1
    }"
  >
    <a href="#" class="detail-link" @click.prevent="open">
      <v-icon>fas fa-layer-group</v-icon>
    </a>

    <template v-if="expansion.releases.length === 1">
      <ReleaseButtons :release="expansion.releases[0]">
        <div class="exp-title">
          <ExpansionSymbol :expansion="expansion" />
          <h3>{{ expansion.title }}</h3>
        </div>
      </ReleaseButtons>
    </template>
    <template v-else>
      <div class="exp-title" @click="onMultisetTitleClick">
        <ExpansionSymbol :expansion="expansion" />
        <h3>{{ expansion.title }}</h3>
      </div>
      <div
        v-for="(release, idx) in expansion.releases"
        :key="idx"
        class="tile-set-row"
      >
        <ReleaseButtons :release="release">
          <h4 :title="release.note">{{ release.title }}</h4>
        </ReleaseButtons>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ExpansionSymbol from '@/components/ExpansionSymbol'
import ReleaseButtons from '@/components/game-setup/buttons/ReleaseButtons'

export default {
  components: {
    ExpansionSymbol,
    ReleaseButtons
  },

  props: {
    expansion: { type: Object, required: true }
  },

  computed: {
    ...mapState({
      sets: state => state.gameSetup.sets || {}
    }),

    selected () {
      for (const release of this.expansion.releases) {
        for (const id of release.sets) {
          if (this.sets[id]) {
            return true
          }
        }
      }
      return false
    }
  },

  methods: {
    open () {
      this.$emit('open-detail', this.expansion)
    },

    onMultisetTitleClick () {
      if (this.selected) {
        for (const release of this.expansion.releases) {
          this.$store.dispatch('gameSetup/setReleaseQuantity', { release, quantity: 0 })
        }
      } else {
        this.$store.dispatch('gameSetup/setReleaseQuantity', { release: this.expansion.releases[0], quantity: 1 })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.exp-box
  display: flex
  flex-direction: column
  position: relative

  +theme using ($theme)
    color: map-get($theme, 'cards-text')
    background-color: map-get($theme, 'cards-bg')

  .exp-title
    text-align: center
    padding: 24px 0 8px 0

    svg
      +theme using ($theme)
        fill: map-get($theme, 'cards-text')

    h3
      font-size: 1.09em
      font-weight: 300
      margin-top: 16px

    .exp-symbol
      display: block
      margin: 0 auto
      width: 55px
      height: 55px

  .detail-link
    position: absolute
    display: block
    text-decoration: none
    top: 0
    right: 0

    .v-icon
      font-size: 28px
      margin: 8px
      transition: none !important

      +theme using ($theme)
        color: map-get($theme, 'link-detail-color')

    &:hover .v-icon
      color: black

  &.selected
    +theme using ($theme)
      background: map-get($theme, 'cards-selected-bg')
      box-shadow: map-get($theme, 'cards-selected-shadow')

    h3
      +theme using ($theme)
        color: map-get($theme, 'cards-selected-text')

    .exp-title
      svg
        +theme using ($theme)
          fill: map-get($theme, 'cards-selected-text')

    .detail-link
      .v-icon
        +theme using ($theme)
          color: map-get($theme, 'link-detail-selected-color')

      &:hover .v-icon
        +theme using ($theme)
          color: map-get($theme, 'cards-selected-text')

.multiset
  .exp-title
    cursor: pointer
    padding-bottom: 20px

  h4
    margin-bottom: 6px

.tile-set-row
  text-align: center
  flex: 1
  display: flex
  align-items: flex-end
  justify-content: stretch

  +theme using ($theme)
    border-top: 1px solid #{map-get($theme, 'line-color-light')}

  .quantity-buttons
    width: 100%

  h4
    text-align: center
    font-weight: 400

// .exp-box.multiset-3
//   .tile-set-row
//     .tile-set-buttons
//       height: 48px

</style>
