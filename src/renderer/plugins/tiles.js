import fs from 'fs'
import path from 'path'

import Vue from 'vue'

class Tiles {
  constructor (vue) {
    this.tiles = {}
    this.multiTiles = {}
    this.sets = {}
    this.loaded = false
  }

  getTilesCounts (sets, rules, edition, start = null) {
    const counts = {}
    const remove = {}
    Object.entries(sets).forEach(([id, setCount]) => {
      if (setCount) {
        const set = this.sets[id] || this.sets[id + ':' + edition]
        Object.entries(set.tiles).forEach(([tileId, tileCount]) => {
          counts[tileId] = (counts[tileId] || 0) + setCount * tileCount
          const { max } = this.tiles[tileId]
          if (max) {
            counts[tileId] = Math.min(counts[tileId], max)
          }
        })
        if (set.remove) {
          set.remove.forEach(id => { remove[id] = true })
        }
      }
    })
    Object.keys(remove).forEach(id => { delete counts[id] })
    if (counts['GQ/RFI']) {
      if (start && start.id === 'spring-alt') {
        delete counts['RI/s']
      } else {
        delete counts['GQ/RFI']
      }
    }
    if (sets.monasteries && rules && rules['keep-monasteries'] === 'replace') {
      delete counts['BA/L']
      delete counts['BA/LR']
    }
    return counts
  }

  getPackSize (sets, rules) {
    const counts = this.getTilesCounts(sets, rules, '1') // both editions should provide same size
    return Object.entries(counts).reduce((total, [tileId, tileCount]) => total + tileCount, 0)
  }
}

export default ({ app }, inject) => {
  const $tiles = new Tiles()
  Vue.prototype.$tiles = $tiles

  // in dev script is in plugins dir, in production all is compiled by webpack to a single file in rendeder root
  fs.readFile(path.join(__resources, 'tiles.json'), (err, data) => {
    if (err) {
      console.error(err)
      return
    }

    const json = JSON.parse(data)
    $tiles.tiles = json.tiles
    $tiles.multiTiles = json.multiTiles
    $tiles.sets = json.sets
    $tiles.loaded = true
    console.log('tiles.json loaded')

    app.store.commit('tilesLoaded')
  })
}
