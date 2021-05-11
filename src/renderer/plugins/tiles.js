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

  // helper
  sortByEdge (a, b) {
    const ae = { c: 0, r: 0, i: 0 }
    const be = { c: 0, r: 0, i: 0 }
    a.edge.split('').forEach(ch => { ae[ch] += 1 })
    b.edge.split('').forEach(ch => { be[ch] += 1 })
    if (ae.i !== be.i) {
      return ae.i - be.i
    }
    if (ae.c !== be.c) {
      return be.c - ae.c
    }
    return ae.r - be.r // less roads first
  }
}

export default ({ app }, inject) => {
  const $tiles = new Tiles()
  Vue.prototype.$tiles = $tiles

  // in dev script is in plugins dir, in production all is compiled by webpack to a single file in rendeder root
  fs.readFile(path.join(process.resourcesPath, 'tiles.json'), (err, data) => {
    if (err) {
      console.error(err)
      return
    }

    const json = JSON.parse(data)
    $tiles.tiles = json.tiles
    $tiles.tiles['AM/A'] = {
      symmetry: 4,
      edge: '****'
    }
    $tiles.multiTiles = json.multiTiles
    $tiles.sets = json.sets
    $tiles.loaded = true
    console.log('tiles.json loaded')

    app.store.commit('tilesLoaded')
  })
}
