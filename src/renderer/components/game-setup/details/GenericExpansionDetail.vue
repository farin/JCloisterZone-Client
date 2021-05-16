<template>
  <div>
    <div
      v-for="(release, idx) in expansion.releases"
      :key="idx"
      class="mt-2"
    >
      <h5 v-if="expansion.releases.length > 1">{{ release.title }}</h5>
      <TileDistribution :sets="setsToDict(release.sets)" />
    </div>
  </div>
</template>

<script>
import TileDistribution from '@/components/TileDistribution'

export default {
  components: {
    TileDistribution
  },

  props: {
    expansion: { type: Object, required: true }
  },

  methods: {
    setsToDict (sets) {
      const obj = {}
      sets.forEach(s => { obj[s] = 1 })
      return obj
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
