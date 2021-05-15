import fs from 'fs'
import path from 'path'

import Vue from 'vue'
import sortBy from 'lodash/sortBy'

import { Expansion, Release } from '@/models/expansions'

const SIDES = ['N', 'E', 'S', 'W']
const EDGE_CODE = {
  city: 'c',
  road: 'r',
  farm: 'f',
  river: 'i'
}

function getFeatureSignature (feature) {
  const attrs = feature.attributes
  const alist = [feature.tagName]
  for (let i = attrs.length - 1; i >= 0; i--) {
    alist.push(attrs[i].name + '=' + attrs[i].value)
  }
  alist.sort()
  // save edge code to first char for getEdge
  return EDGE_CODE[feature.tagName] + '|' + alist.join(',')
}

function getSymmetry (features) {
  const sym0 = (features.N !== features.S || features.NL !== features.SL || features.WR !== features.SR ||
          features.W !== features.E || features.WL !== features.EL || features.WR !== features.ER)
  if (sym0) return 0

  const sym2 = features.N !== features.E || features.NL !== features.EL || features.NR !== features.ER
  return sym2 ? 2 : 4
}

function getEdges (features) {
  const sides = []
  SIDES.forEach(side => {
    const f = features[side]
    if (f) {
      sides.push(f.charAt(0))
    } else {
      sides.push(features[side + 'L'] ? 'f' : '*')
    }
  })
  return sides.join('')
}

class Tiles {
  constructor (ctx) {
    this.ctx = ctx
    this.tiles = {}
    this.sets = {}
    this.loaded = false
    this.expansions = []
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

  async loadExpansions () {
    const { settings } = this.ctx.store.state
    const userDataPath = window.process.argv.find(arg => arg.startsWith('--user-data=')).replace('--user-data=', '')

    const lookupFolders = [
      path.join(userDataPath, 'expansions'),
      process.resourcesPath + '/expansions/'
    ]

    const xmls = []

    for (const lookupFolder of lookupFolders) {
      let listing
      try {
        listing = await fs.promises.readdir(lookupFolder)
      } catch (e) {
        console.log(`${lookupFolder} does not exist`)
        continue
      }
      listing.filter(f => {
        const ext = f.substr(f.lastIndexOf('.') + 1)
        return ext === 'xml'
      }).forEach(f => xmls.push(lookupFolder + f))
    }

    for (const fullPath of settings.userExpansions) {
      try {
        const stats = await fs.promises.stat(fullPath)
        if (stats.isFile()) {
          console.log(`Loading user expansion ${fullPath}`)
          xmls.push(fullPath)
        }
      } catch (err) {
        console.log(`${fullPath} is not accesible`)
      }
    }

    // clean priosly loaded
    this.expansions.forEach(exp => {
      delete Expansion[exp.name]
    })

    const tiles = {}
    const sets = {}
    const expansions = []

    const parser = new DOMParser()
    for (const xml of xmls) {
      const content = await fs.promises.readFile(xml)
      const doc = parser.parseFromString(content, 'application/xml')

      doc.querySelectorAll('tile[id]').forEach(t => {
        const id = t.getAttribute('id')
        const features = {}
        for (const feature of t.children) {
          if (feature.childElementCount) continue // wagon move etc
          const content = feature.textContent.trim()
          if (content) {
            const signature = getFeatureSignature(feature)
            content.split(/\s+/).forEach(loc => {
              features[loc] = signature
            })
          }
        }

        const tile = {
          symmetry: getSymmetry(features),
          edge: getEdges(features)
        }

        const mx = t.getAttribute('max')
        if (mx) {
          tile.max = parseInt(mx)
        }

        tiles[id] = tile
      })

      doc.querySelectorAll('tile-set[id]').forEach(ts => {
        const id = ts.getAttribute('id')
        const max = ts.getAttribute('max')
        const setTiles = {}
        ts.querySelectorAll('ref').forEach(ref => {
          const count = ref.getAttribute('count')
          setTiles[ref.getAttribute('tile')] = parseInt(count || 1)
        })
        const set = { tiles: setTiles }
        if (max) {
          set.max = parseInt(max)
        }
        const remove = Array.from(ts.querySelectorAll('remove')).map(r => r.getAttribute('tile'))
        if (remove.length) {
          set.remove = remove
        }

        sets[id] = set
      })

      doc.querySelectorAll('expansion').forEach(el => {
        const name = el.getAttribute('id')
        const title = el.querySelector('title').textContent || name
        const tileSets = Array.from(el.querySelectorAll('ref[tile-set]')).map(ref => ref.getAttribute('tile-set'))

        if (Expansion[name]) {
          console.error(`Expansion ${name} is already defined`)
          return
        }

        const exp = new Expansion(name, title, [new Release(name, tileSets)], { fan: true })

        Expansion[name] = exp
        expansions.push(exp)
      })
    }

    tiles['AM/A'] = {
      symmetry: 4,
      edge: '****'
    }

    this.xmls = xmls
    this.tiles = tiles
    this.sets = sets
    this.expansions = sortBy(expansions, 'name')
    this.loaded = true

    console.log('Expansions definitions loaded.')
    this.ctx.app.store.commit('tilesLoaded')
  }
}

export default (ctx, inject) => {
  const $tiles = new Tiles(ctx)
  Vue.prototype.$tiles = $tiles
}
