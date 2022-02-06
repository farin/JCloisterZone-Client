<template>
  <div>
    <p v-if="expansion.links && expansion.links.length">
      <RulesLink
        v-for="(link, idx) in expansion.links"
        :key="idx"
        :title="link.title"
        :type="link.type"
        :href="link.url"
      />
    </p>

    <div v-if="descriptionParagraphs.length">
      <p
        v-for="(text, idx) in descriptionParagraphs"
        :key="idx"
      >
        {{ text }}
      </p>
    </div>

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
import RulesLink from '@/components/RulesLink'
import TileDistribution from '@/components/TileDistribution'

export default {
  components: {
    RulesLink,
    TileDistribution
  },

  props: {
    expansion: { type: Object, required: true }
  },

  computed: {
    descriptionParagraphs () {
      return (this.expansion.description || '').split(/\n{2,}/g)
    }
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
