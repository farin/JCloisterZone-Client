import uniq from 'lodash/uniq'

import { Expansion } from '@/models/expansions'
import { isConfigValueEnabled } from '@/models/elements'

export default {
  computed: {
    releases () {
      const releases = []
      const edition = this.elements.garden ? 2 : 1
      const expansions = this.$tiles.getExpansions(this.sets, edition)
      Object.keys(expansions).forEach(expId => {
        const expansion = Expansion[expId]
        for (const release of expansion.releases) {
          const quantities = release.sets
            .filter(id => !this.$tiles.isTileSetExcluded(id, expansions, edition))
            .map(id => this.sets[id] || this.sets[id + ':' + edition] || 0)
          const min = Math.min(...quantities)
          const max = Math.max(...quantities)
          const quantity = min === max ? min : -1
          if (quantity !== 0) {
            releases.push({ expansion, id: expansion.name, title: release.title, quantity })
          }
        }
      })
      return releases
    },

    nonDefaultElements () {
      const defaults = this.$tiles.getDefaultElements(this.sets)
      const keys = uniq([...Object.keys(defaults), ...Object.keys(this.elements)])
      const diff = {}
      keys.forEach(cid => {
        if (defaults[cid] !== this.elements[cid]) {
          diff[cid] = this.elements[cid] === undefined ? false : this.elements[cid]
        }
      })
      if (this.elements.abbot) {
        if (this.elements.garden) {
          delete diff.garden
        } else {
          diff.garden = 'off'
        }
      }
      return Object.entries(diff)
    },

    additions () {
      return this.nonDefaultElements.filter(el => isConfigValueEnabled(el[1]))
    },

    removals () {
      return this.nonDefaultElements.filter(el => !isConfigValueEnabled(el[1]))
    },

    configElementsSize () {
      return this.releases.length + this.nonDefaultElements.length
    }
  },

  methods: {
    isConfigValueEnabled (val) {
      return isConfigValueEnabled(val)
    }
  }
}
