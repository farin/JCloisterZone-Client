<template>
  <div
    class="events-row"
  >
    <div v-if="row.title" class="events-row-title">{{ row.title }}</div>
    <div class="events-row-events">
      <PlayEvent
        v-for="(ev, i) in row.events"
        :key="i"
        :ev="ev"
        :player="player"
      />
    </div>
  </div>
</template>

<script>
import PlayEvent from '@/components/game/play-events/PlayEvent'

export default {
  components: {
    PlayEvent
  },

  props: {
    row: { type: Object, required: true },
    player: { type: Number, default: null }
  }
}
</script>

<style lang="sass" scoped>
.events-row
  position: absolute
  left: 10px

  padding-right: 0
  border-right: 1px solid rgba(192, 192, 192, 0.2)

  &:last-child
    margin-bottom: 0

.events-row-title
  font-size: 11px
  text-transform: uppercase
  margin: 2px 0

.events-row-events
  display: flex
</style>
