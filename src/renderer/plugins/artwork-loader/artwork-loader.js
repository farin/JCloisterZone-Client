import fs from 'fs'
import path from 'path'

import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import mapValues from 'lodash/mapValues'

import { Path } from 'paper/dist/paper-core'
import { grammar, createSemantics } from '@/plugins/ohm/shape-template'

const FEATURE_PATTERN = /([^[]+)(?:\[([^\]]+)\])/
const EMPTY_PATH = 'M0 0 Z'

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

export default class ArtworkLoader {
  async loadArworks (enabledArtworks) {
    this.artworks = {}
    this.tiles = {}

    this.refs = {}
    // this.backrefs = {}
    this.clipMatch = {}

    for (const artwork of enabledArtworks) {
      await this.loadArtwork(artwork)
    }

    return {
      artworks: this.artworks,
      tiles: this.tiles
    }
  }

  async loadArtwork ({ id, folder, json, jsonFile }) {
    this.vars = {}
    this.features = {}
    this.semantics = createSemantics(this)

    const artwork = this.artworks[id] = {
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
      elements: {},
      pathPrefix: `file://${folder}/`
    }

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
      artwork.background.image = makeAbsPath(artwork.pathPrefix, artwork.background.image)
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
      doc.querySelectorAll('image').forEach(el => el.setAttribute('href', artwork.pathPrefix + el.getAttribute('href')))
      document.getElementById('theme-resources').innerHTML += doc.documentElement.outerHTML
    }

    for (const fname of json.pathsInclude || []) {
      const content = JSON.parse(await fs.promises.readFile(path.join(folder, fname)))
      Object.entries(content).forEach(([id, value]) => {
        if (this.vars[id]) {
          console.error(`Path ${id} is already defined`)
        }
        this.vars[id] = value
      })
    }

    for (const fname of json.featuresInclude || []) {
      const content = JSON.parse(await fs.promises.readFile(path.join(folder, fname)))
      Object.entries(content).forEach(([featureId, data]) => {
        const m = FEATURE_PATTERN.exec(featureId)
        if (m) {
          featureId = m[1]
          data.params = m[2].split(',')
        }
        this.processFeature(artwork, featureId, data)
        this.features[featureId] = data
      })
    }

    // console.log({ ...this.refs })

    while (true) {
      const entries = Object.entries(this.refs)
      if (entries.length === 0) break

      let injected = false
      entries.forEach(([featureId, refs]) => {
        if (refs.findIndex(r => this.refs[r]) !== -1) return

        const r = this.clipMatch[featureId]

        // TODO save semantics intead of MatchResult ?
        const clip = this.semantics(r).eval()
        const [id, rotKey] = featureId.split('@')
        const feature = this.features[id]
        if (rotKey) feature['@' + rotKey].clip = clip
        else if (feature.clip) feature.clip = clip
        else if (feature['clip-rotate']) feature['clip-rotate'] = clip

        injected = true
        delete this.refs[featureId]
      })
      if (!injected) {
        console.error('Circular clip reference detected.')
        break
      }
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
      Object.entries(content).forEach(([tileId, data]) => this.processTile(artwork, tileId, data))
    }

    Object.entries(artwork.aliases).forEach(([id, alias]) => {
      this.tiles[id] = this.tiles[alias]
    })

    console.log(`Loaded artwork '${id}' from ${folder}`)
  }

  processTile (artwork, tileId, data) {
    if (this.tiles[tileId]) {
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
        makeAbsPathProp(artwork.pathPrefix, data.image, 'href', artwork.id)
        tile.image = data.image
      } else {
        makeAbsPathProp(artwork.pathPrefix, data, 'image', artwork.id)
        tile.image = data.image
      }
    }

    Object.entries(data.features).forEach(([loc, f]) => {
      if (isString(f)) {
        f = this.getFeature(tileId, f)
      } else if (isObject(f)) {
        if (f.id) {
          const sharedFeature = this.getFeature(tileId, f.id)
          Object.assign(f, sharedFeature)
        }
      }
      tile.features[loc] = f
    })

    this.tiles[tileId] = tile
  }

  getFeature (tileId, id) {
    const m = FEATURE_PATTERN.exec(id)
    const baseId = m ? m[1] : id
    const baseFeature = this.features[baseId]

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
    let feature = this.features[key]
    if (feature) {
      return feature
    }

    feature = { ...baseFeature }
    if (feature.images) {
      feature.images = feature.images.filter(img => this.isMatchingParams(img, params))
    }
    for (let i = 0; i < 4; i++) {
      const key = '@' + i
      if (feature[key]) {
        if (feature[key].images) {
          feature[key] = {
            ...feature[key],
            images: feature[key].images.filter(img => this.isMatchingParams(img, params))
          }
        }
      }
    }
    this.features[key] = feature
    return feature
  }

  isMatchingParams (img, params) {
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

  processFeature (artwork, featureId, data) {
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
        if (isString(data.images[i])) data.images[i] = makeAbsPath(artwork.pathPrefix, data.images[i], artwork.id)
        if (data.images[i] && data.images[i].href) data.images[i].href = makeAbsPath(artwork.pathPrefix, data.images[i].href, artwork.id)
      }
    }

    if (data.clip && !this.validateFeatureClip(featureId, data.clip)) data.clip = EMPTY_PATH
    if (data['clip-rotate'] && !this.validateFeatureClip(featureId, data['clip-rotate'])) data['clip-rotate'] = EMPTY_PATH

    forEachRotation(data, (item, rot) => {
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
          if (isString(item.images[i])) item.images[i] = makeAbsPath(artwork.pathPrefix, item.images[i], artwork.id)
          if (item.images[i] && item.images[i].href) item.images[i].href = makeAbsPath(artwork.pathPrefix, item.images[i].href, artwork.id)
        }
      }

      if (item.clip && !this.validateFeatureClip(featureId + rot, item.clip)) item.clip = EMPTY_PATH
    })
  }

  validateFeatureClip (featureId, clip) {
    const r = grammar.match(clip)
    if (r.failed()) {
      console.error(`Invalid clip for ${featureId}\n${r.message}`)
      return false
    }

    this.clipMatch[featureId] = r

    const { expr, refs } = this.semantics(r).getRefs()
    if (expr) {
      this.refs[featureId] = refs

      // refs.forEach(ref => {
      //   let backref = this.backrefs[ref]
      //   if (!backref) {
      //     backref = this.backrefs[ref] = []
      //   }
      //   backref.push(featureId)
      // })
    }

    return true
  }
}
