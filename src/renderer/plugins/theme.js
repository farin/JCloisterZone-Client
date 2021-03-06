import fs from 'fs'
import path from 'path'

import Vue from 'vue'
import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import sortBy from 'lodash/sortBy'
import mapValues from 'lodash/mapValues'

import Location from '@/models/Location'
import { EventsBase } from '@/utils/events'

const FEATURE_PATTERN = /([^[]+)(?:\[([^\]]+)\])/

const NULL_ARTWORK = {
  id: '_null',
  tileSize: 1000,
  background: null,
  scaleTransform: '',
  inverseScaleTransform: ''
}

const FEATURE_ORDER = {
  N: 10,
  NW: 11,
  NE: 12,
  W: 20,
  E: 30,
  SW: 35,
  S: 40,
  SE: 41,
  I: 51,
  II: 52,
  III: 53,
  IV: 54
}

const MISC_SVG = require('~/assets/misc.svg')

const makeAbsPath = (prefix, path, artworkId = null) => {
  if (!path || path[0] === '/') {
    return path
  }
  if (path[0] === '#') {
    return `#${artworkId}-${path.substring(1)}`
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

const makeAbsPathProp = (prefix, obj, prop, artworkId) => {
  if (isString(obj[prop])) {
    obj[prop] = makeAbsPath(prefix, obj[prop], artworkId)
  } else if (isObject(obj[prop])) {
    forEachRotation(obj[prop], (item, rot) => {
      obj[prop][rot] = makeAbsPath(prefix, item, artworkId)
    })
  }
}

class Theme extends EventsBase {
  constructor (ctx) {
    super()
    this.artworks = {}
    this.tiles = {}
    this.tileLayers = {}
    this.ctx = ctx
  }

  async loadArtworks () {
    this._artworks = {}
    this._tiles = {}

    const { settings } = this.ctx.store.state
    console.log(`Loading enabled artworks. (${settings.enabledArtworks})`)

    let resourcesContainer = document.getElementById('theme-resources')
    if (resourcesContainer) {
      resourcesContainer.innerHTML = ''
    } else {
      resourcesContainer = document.createElement('div')
      resourcesContainer.setAttribute('id', 'theme-resources')
      document.body.appendChild(resourcesContainer)
    }

    const artworks = {}
    for (const addon of this.ctx.$addons.addons) {
      if (addon.error) continue
      for (const artwork of addon.artworks) {
        artworks[artwork.id] = artwork
      }
    }

    for (const id of settings.enabledArtworks) {
      const artwork = artworks[id]
      if (artwork) {
        await this.loadArtwork(artwork)
      }
    }

    this.artworks = this._artworks
    this.tiles = this._tiles
    this.tileLayers = {}
    delete this._artwork
    delete this._tiles
    this.ctx.app.store.commit('artworksLoaded')
    this.emit('load')
  }

  async loadArtwork ({ id, folder, json, jsonFile }) {
    const artwork = this._artworks[id] = {
      id,
      title: json.title || id,
      icon: json.icon,
      artist: json.artist,
      description: json.description,
      version: json.version,
      perspective: json.perspective || 'rotate',
      background: null,
      tileSize: parseInt(json.tileSize) || 1000,
      classes: json.classes || {},
      defaultZindex: json.defaultZindex === undefined ? 1 : json.defaultZindex,
      aliases: json.aliases || {},
      symbols: {},
      features: {},
      tiles: {},
      elements: {}
    }
    const pathPrefix = `file:///${folder}/`

    if (artwork.tileSize === 1000) {
      artwork.scaleTransform = ''
      artwork.inverseScaleTransform = ''
    } else {
      const s = 1000.0 / artwork.tileSize
      const inv = artwork.tileSize / 1000.0
      artwork.scaleTransform = `scale(${s} ${s})`
      artwork.inverseScaleTransform = `scale(${inv} ${inv})`
    }

    if (json.background) {
      artwork.background = { ...json.background }
      artwork.background.image = makeAbsPath(pathPrefix, artwork.background.image)
      // TODO preload background
    }

    for (const res of json.resources || []) {
      if (path.extname(res) !== '.svg') {
        console.error('Only SVG resources are allowed')
        continue
      }
      const content = await fs.promises.readFile(path.join(folder, res))
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, 'image/svg+xml')
      doc.querySelectorAll('symbol').forEach(el => {
        const symbolId = `${id}-${el.getAttribute('id')}`
        el.setAttribute('id', symbolId)
        const [w, h] = el.getAttribute('viewBox').split(' ').slice(2).map(val => parseInt(val))
        artwork.symbols[symbolId] = { size: [w, h] }
      })
      doc.querySelectorAll('image').forEach(el => el.setAttribute('href', pathPrefix + el.getAttribute('href')))
      document.getElementById('theme-resources').innerHTML = doc.documentElement.outerHTML
    }

    const processFeature = (featureId, data) => {
      data.id = featureId
      if (data.image) {
        if (data.images) {
          console.warn(`Feature ${featureId} shouldn't declare 'image' either 'images' property`)
          data.images.push(data.image)
        } else {
          data.images = [data.image]
        }
        delete data.image
      }
      if (data.images) {
        for (let i = 0; i < data.images.length; i++) {
          if (isString(data.images[i])) data.images[i] = makeAbsPath(pathPrefix, data.images[i], id)
          if (data.images[i] && data.images[i].href) data.images[i].href = makeAbsPath(pathPrefix, data.images[i].href, id)
        }
      }
      forEachRotation(data, item => {
        if (item.image) {
          if (item.images) {
            console.warn(`Feature ${featureId} shouldn't declare 'image' either 'images' property`)
            item.images.push(item.image)
          } else {
            item.images = [item.image]
          }
          delete item.image
        }
        if (item.images) {
          for (let i = 0; i < item.images.length; i++) {
            if (isString(item.images[i])) item.images[i] = makeAbsPath(pathPrefix, item.images[i], id)
            if (item.images[i] && item.images[i].href) item.images[i].href = makeAbsPath(pathPrefix, item.images[i].href, id)
          }
        }
      })
    }

    const features = {}

    for (const fname of json.featuresInclude || []) {
      const content = JSON.parse(await fs.promises.readFile(path.join(folder, fname)))
      Object.entries(content).forEach(([featureId, data]) => {
        const m = FEATURE_PATTERN.exec(featureId)
        if (m) {
          featureId = m[1]
          data.params = m[2].split(',')
        }
        processFeature(featureId, data)
        features[featureId] = data
      })
    }

    const inlineClipRefs = feature => {
      if (feature.clip) {
        feature.clip = feature.clip.replace(/\$\{([^}]+)\}/g, (match, p1) => {
          const [id, rotKey] = p1.split('@')
          let feature = features[id]
          if (rotKey !== undefined) {
            feature = feature['@' + rotKey]
          }
          return feature.clip
        })
      }
    }

    for (const feature of Object.values(features)) {
      inlineClipRefs(feature)
      forEachRotation(feature, inlineClipRefs)
    }

    const processTile = (tileId, data) => {
      if (this._tiles[tileId]) {
        // tile already registred by prev artwork
        // currently there is time load fixed order
        return
      }

      const tile = {
        id: tileId,
        rotation: data.rotation || 0,
        artwork,
        features: {}
      }

      if (data.image) {
        if (data.image.href) {
          makeAbsPathProp(pathPrefix, data.image, 'href', id)
          tile.image = data.image
        } else {
          makeAbsPathProp(pathPrefix, data, 'image', id)
          tile.image = data.image
        }
      }

      const isMatchingParams = (img, params) => {
        if (!img.if) {
          return true
        }
        let conditions
        const or = img.if.includes('||')
        const and = img.if.includes('&&')
        if (or && and) {
          throw new Error('both || and && is not allowed in one expression')
        }
        if (and) {
          conditions = img.if.split(/\s*&&\s*/)
        } else if (or) {
          conditions = img.if.split(/\s*\|\|\s*/)
        } else {
          conditions = [img.if]
        }
        const values = conditions.map(cond => cond[0] === '!' ? !params.includes(cond.substring(1)) : params.includes(cond))
        if (or) {
          return values.includes(true)
        }
        return !values.includes(false)
      }

      const getFeature = id => {
        const m = FEATURE_PATTERN.exec(id)
        const baseId = m ? m[1] : id
        const baseFeature = features[baseId]

        if (!baseFeature) {
          throw new Error(`Feature ${id} is not defined for ${tileId}`)
        }
        if (!baseFeature.params) {
          return baseFeature
        }

        let params
        if (m) {
          params = m[2].split(',')
          params.sort()
        } else {
          params = []
        }

        params.sort()
        const key = `${baseId}[${params.join(',')}]`
        let feature = features[key]
        if (feature) {
          return feature
        }

        feature = { ...baseFeature }
        if (feature.images) {
          feature.images = feature.images.filter(img => isMatchingParams(img, params))
        }
        for (let i = 0; i < 4; i++) {
          const key = '@' + i
          if (feature[key]) {
            if (feature[key].images) {
              feature[key] = {
                ...feature[key],
                images: feature[key].images.filter(img => isMatchingParams(img, params))
              }
            }
          }
        }
        features[key] = feature
        return feature
      }

      Object.entries(data.features).forEach(([loc, f]) => {
        if (isString(f)) {
          f = getFeature(f)
        } else if (isObject(f)) {
          if (f.id) {
            const sharedFeature = getFeature(f.id)
            Object.assign(f, sharedFeature)
          }
        }
        tile.features[loc] = f
      })

      this._tiles[tileId] = tile
    }

    for (const fname of json.elementsInclude || []) {
      const content = JSON.parse(await fs.promises.readFile(path.join(folder, fname)))
      Object.assign(artwork.elements, content)
    }
    const parser = new DOMParser()
    artwork.elements = mapValues(artwork.elements, value => {
      if (value.startsWith('<svg')) {
        const doc = parser.parseFromString(value, 'image/svg+xml')
        return {
          tag: 'svg',
          viewBox: doc.documentElement.getAttribute('viewBox'),
          content: doc.documentElement.innerHTML
        }
      }
      console.warn('Unsupported element value: ' + value)
      return null
    })

    for (const fname of json.tilesInclude || []) {
      const content = JSON.parse(await fs.promises.readFile(path.join(folder, fname)))
      Object.entries(content).forEach(([tileId, data]) => processTile(tileId, data))
    }

    Object.entries(artwork.aliases).forEach(([id, alias]) => {
      this._tiles[id] = this._tiles[alias]
    })

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

  getFeature ({ id, position, rotation }, featureType, loc, bridges = []) {
    const bridge = bridges.find(b => b.position[0] === position[0] && b.position[1] === position[1])
    if (bridge && loc === bridge.location) {
      return {
        clip: 'M 0 600 L 0 400 L 1000 400 L 1000 600 L 850 600 C 850 435 150 435 150 600 Z',
        point: [750, 500],
        rotation: loc === 'NS' ? 90 : 0,
        bridge: true
      }
    }

    // TODO define Casle shape in artwork
    if (featureType === 'Castle') {
      featureType = 'City'
    }

    if (loc === 'AS_ABBOT') {
      loc = 'I'
    } else if (rotation !== 0) {
      loc = Location.parse(loc).rotateCCW(rotation).name
    }

    const tile = this.getTile(id)
    let feature = tile?.features[`${featureType}/${loc}`]

    if (!feature) {
      throw new Error(`Artwork doesn't provide feature for ${id} ${featureType}/${loc}`)
    }

    // TODO migrate classic to rotate instead rotation and drop rotation here
    const rotateFeature = feature.rotation || feature.rotate || 0
    let r = rotateFeature
    let root = feature
    if (tile.artwork.perspective === 'rotate') {
      r = (r + rotation) % 360
    } else {
      const rotKey = '@' + (((r + rotation) / 90) % 4)
      if (feature[rotKey]) {
        root = feature
        feature = feature[rotKey]
        r = 0 // rotation is already projected to rotKEy
      }
    }

    let clip = feature.clip || root.clip
    let point = feature.point || root.point

    if (!clip && root?.['clip-rotate']) {
      if (!root['point-rotate']) {
        throw new Error('clipe-rotate must be declared together with point-rotate')
      }
      // although fixed perspective, clip is declared as rotation of base shape
      clip = root['clip-rotate']
      point = root['point-rotate']
      r = (rotateFeature + rotation) % 360
    }

    const transform = feature.transform || ' '
    return {
      clip,
      point,
      transform: `${tile.artwork.scaleTransform} ${transform}`,
      inverseScaleTransform: tile.artwork.inverseScaleTransform,
      rotation: r
    }
  }

  getElementImage (id) {
    for (const artwork of Object.values(this.artworks)) {
      const value = artwork.elements[id]
      if (value) {
        return value
      }
    }
  }

  _createTileLayer (artwork, image, featureTransform, perspective, rotation) {
    let href
    if (image.href) {
      href = image.href
    } else {
      href = image
    }

    const attrs = {}
    if (image.class) {
      image.class.split(/\s+/).forEach(cls => {
        Object.assign(attrs, artwork.classes[cls] || {})
      })
    }

    const svgRef = href[0] === '#' || href.includes('.svg#')
    let width = artwork.tileSize
    let height = artwork.tileSize
    const x = image.x || attrs.x || 0
    const y = image.y || attrs.y || 0

    if (svgRef) {
      const size = artwork.symbols[href.substring(1)]?.size
      if (size === undefined) {
        console.warn(`Size symbol is missing for ${href}`)
      } else {
        width = size[0]
        height = size[1]
      }
    } else {
      if (attrs.width) width = attrs.width
      if (image.width) width = image.width
      if (attrs.height) height = attrs.height
      if (image.height) height = image.height
    }

    const props = { x, y, width, height, href }

    if (attrs.style) props.style = attrs.style
    if (image.style) props.style = image.style

    const layer = {
      tag: svgRef ? 'use' : 'image',
      props,
      zindex: [attrs.zindex, image.zindex, artwork.defaultZindex].find(z => z !== null && z !== undefined)
    }

    const transform = []
    if (perspective === 'rotate' && rotation) {
      transform.push(`rotate(${rotation} ${artwork.tileSize / 2} ${artwork.tileSize / 2})`)
    }
    if (featureTransform) {
      transform.push(featureTransform)
    }
    if (attrs.transform) {
      transform.push(attrs.transform)
    }
    if (image.transform) {
      transform.push(image.transform)
    }
    if (transform.length) {
      layer.props.transform = transform.join(' ')
    }

    return layer
  }

  getTileLayers (id, rotation) {
    const cacheKey = `${id}@${rotation}`
    const cachedValue = this.tileLayers[cacheKey]
    if (cachedValue) {
      return cachedValue
    }

    const tile = this.getTile(id)
    if (!tile) {
      return {
        artwork: NULL_ARTWORK,
        layers: [{ tag: 'use', props: { 'data-tile-id': id, 'href': `${MISC_SVG}#missing-image` }, zindex: 1 }]
      }
    }

    const getRecordForRotation = (obj, rotation) => {
      const rotKey = '@' + (rotation / 90)
      if (obj && obj[rotKey]) {
        return { ...obj, ...obj[rotKey] }
      }
      return obj
    }

    const { artwork } = tile
    let layers = []

    if (tile.image) {
      const image = getRecordForRotation(tile.image, rotation)
      if (isString(image) || image.href) {
        const layer = this._createTileLayer(artwork, image, null, artwork.perspective, rotation)
        layer.order = 1
        layers.push(layer)
      }
    }

    Object.entries(tile.features).forEach(([featureLoc, f]) => {
      if (!f) {
        throw new Error(`Misssing definition for feature ${tile.id} ${featureLoc}`)
      }

      const perspective = f.perspective || artwork?.perspective
      let r = rotation
      if (f.rotate) {
        r = (r + f.rotate) % 360
      }

      f = getRecordForRotation(f, r)
      const loc = featureLoc.split('/')[1]
      const locObj = Location.parse(loc)
      const actualLoc = locObj ? locObj.rotateCW(rotation).name : loc

      const processImage = (image, t) => {
        const order = FEATURE_ORDER[actualLoc]
        const layer = this._createTileLayer(artwork, image, f.transform, perspective, r)
        layer.order = order === undefined ? 9 : order
        layers.push(layer)
      }

      if (f.images) {
        for (const img of f.images) {
          processImage(img)
        }
      }
    })

    layers = sortBy(layers, 'order')
    layers = sortBy(layers, 'zindex')
    layers.forEach(layer => { delete layer.order })

    return (this.tileLayers[cacheKey] = {
      artwork,
      layers
    })
  }
}

export default (ctx, inject) => {
  let theme = null

  Object.defineProperty(Vue.prototype, '$theme', {
    get () {
      if (theme === null) {
        theme = new Theme(ctx)
      }
      return theme
    }
  })
}
