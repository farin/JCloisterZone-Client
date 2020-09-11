import fs from 'fs'
import path from 'path'
import Vue from 'vue'
import { remote } from 'electron'

import isString from 'lodash/isString'
import isObject from 'lodash/isObject'

import Location from '@/models/Location'


const makeAbsPath = (prefix, path) => {
  if (!path || path[0] === '/') {
    return path
  }
  return prefix + path
}

const forEachRotation = (obj, cb) => {
  for (let i = 0; i < 4; i++) {
    const prop = '@' + i
    const item = obj[prop]
    if (item) cb(item, prop)
  }
}

const makeAbsPathProp = (prefix, obj, prop) => {
  if (isString(obj[prop])) {
    obj[prop] = makeAbsPath(prefix, obj[prop])
  } else if (isObject(obj[prop])) {
    forEachRotation(obj[prop], (item, rot) => {
      obj[prop][rot] = makeAbsPath(prefix, item)
    })
  }
}

const listDir = async parent => {
  let dirs = []
  for (const file of await readdir(parent)) {
    if ((await stat(path.join(parent, file))).isDirectory()) {
      dirs = [...dirs, file]
    }
  }
  return dirs
}



class Theme {
  constructor (vue) {
    this.artworks = {}
    this.tiles = {}
    this.vue = vue
  }

  async loadPlugins () {
    const lookupFolders = [
      path.join(remote.app.getPath('userData'), 'artworks'),
      __resources + '/artworks/'
    ]

    const installedArtworks = []

    for (let lookupFolder of lookupFolders) {
      let listing
      try {
        listing = await fs.promises.readdir(lookupFolder)
      } catch (e) {
        console.log(`${lookupFolder} does not exist`)
        continue
      }
      for (let f of listing) {
        const fullPath = path.join(lookupFolder, f)
        const stats = await fs.promises.stat(fullPath)
        if (stats.isDirectory()) {
          const jsonPath = path.join(fullPath, 'artwork.json')
          try {
            await fs.promises.access(jsonPath, fs.constants.R_OK)
            installedArtworks.push({
              id: f,
              folder: fullPath,
              jsonFile: jsonPath
            })

          } catch (e) {
            // not plugin folder, do nothing
          }
        }
      }
    }

    this.installedArtworks = installedArtworks
    await this.loadArtworks()
  }

  async loadArtworks() {
    this._artworks = {}
    this._tiles = {}

    for (let artwork of this.installedArtworks) {
      await this.loadArtwork(artwork)
    }

    this.artworks = this._artworks
    this.tiles = this._tiles
    delete this._artwork
    delete this._tiles
  }

  async loadArtwork({ id, folder, jsonFile }) {
    const artwork = this._artworks[id] = JSON.parse(await fs.promises.readFile(jsonFile))
    const pathPrefix = `file:///${folder}/`

    artwork.id = id
    if (artwork.background) {
      artwork.background.image = makeAbsPath(pathPrefix, artwork.background.image)
    }
    Object.entries(artwork.features).forEach(([featureId, data]) => {
      data.id = featureId
      if (isString(data.image)) data.image = makeAbsPath(pathPrefix, data.image)
      if (data.image && data.image.href) data.image.href = makeAbsPath(pathPrefix, data.image.href)
      forEachRotation(data, item => {
        if (isString(item.image)) item.image = makeAbsPath(pathPrefix, item.image)
        if (item.image && item.image.href) item.image.href = makeAbsPath(pathPrefix, item.image.href)
      })
    })
    Object.entries(artwork.tiles).forEach(([tileId, data]) => {
      if (this._tiles[tileId]) {
        // tile already registred by prev artwork
        // currently there is time load fixed order
        return
      }

      const tile = {
        id: tileId,
        rotation: data.rotation,
        artwork,
        features: {}
      }

      if (data.background) {
        makeAbsPathProp(pathPrefix, data, 'background')
        tile.background = data.background
      }
      if (data.foreground) {
        makeAbsPathProp(pathPrefix, data, 'foreground')
        tile.foreground = data.foreground
      }

      Object.entries(data.features).forEach(([loc, f]) => {
        if (isString(f)) {
          f = artwork.features[f]
        } else if (isObject(f)) {
          if (f.id) {
            const sharedFeature = artwork.features[f.id]
            Object.assign(f, sharedFeature)
          }
        }
        tile.features[loc] = f
      })

      this._tiles[tileId] = tile
    })

    delete artwork.features
    delete artwork.tiles

    console.log(`Loaded artwork '${id}' from ${folder}`)
  }

  getArtwork (artworkId) {
    return this.artworks[artworkId]
  }

  getTileArtwork (tileId) {
    const tile = this.getTile(tileId)
    return tile ? tile.artwork : null
  }

  getTile (id) {
    const tile = this.tiles[id]
    if (!tile) {
      console.warn(`Tile ${id} is not registered`)
    }
    return tile
  }

  getFeature ({ id, position, rotation }, loc, bridges = []) {
    const bridge = bridges.find(b => b.position[0] === position[0] && b.position[1] === position[1])
    if (bridge && loc === bridge.location) {
      return {
        clip: 'M 0 600 L 0 400 L 1000 400 L 1000 600 L 850 600 C 850 435 150 435 150 600 Z',
        point: [750, 500],
        rotation: loc === 'NS' ? 90 : 0,
        bridge: true
      }
    }

    if (loc === 'MONASTERY') {
      loc = 'CLOISTER'
    } else if (rotation !== 0) {
      loc = Location.parse(loc).rotateCCW(rotation).name
    }

    // console.log(bridges)
    const tile = this.getTile(id)
    const feature = tile.features[loc]

    if (!feature) {
      throw new Error(`Can't find feature for ${id} ${loc}`)
    }

    let r = feature.rotation || 0
    if (tile.artwork.perspective === 'rotate') {
      r = (r + rotation) % 360
    }
    return {
      clip: feature.clip,
      point: feature.point,
      transform: feature.transform,
      rotation: r
    }
  }
}

let theme = null

Object.defineProperty(Vue.prototype, '$theme', {
  get () {
    if (theme === null) {
      theme = new Theme(this)
    }
    return theme
  }
})
