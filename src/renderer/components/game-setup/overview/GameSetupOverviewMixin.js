import uniq from 'lodash/uniq'

import { Expansion } from '@/models/expansions'
import { isConfigValueEnabled, getDefaultElements } from '@/models/elements'

export default {
  computed: {
    tileSets () {
      const tileSets = []
      Expansion.all().forEach(expansion => {
        expansion.sets.forEach(set => {
          const quantity = this.sets[set.id] || this.sets[set.id + ':1'] || this.sets[set.id + ':2']
          if (quantity) {
            tileSets.push({ expansion, set, quantity })
          }
        })
      })
      return tileSets
    },

    nonDefaultElements () {
      const defaults = getDefaultElements(this.sets)
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
    }
  },

  methods: {
    isConfigValueEnabled (val) {
      return isConfigValueEnabled(val)
    }
  }
}
