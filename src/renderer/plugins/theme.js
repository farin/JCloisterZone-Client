import Vue from 'vue'
import isString from 'lodash/isString'
import sortBy from 'lodash/sortBy'

import Location from '@/models/Location'
import { EventsBase } from '@/utils/events'
import ArtworkLoader from './artwork-loader/artwork-loader'
import { BASE_SIZE } from '@/constants/ui'


const NULL_ARTWORK = {
  id: '_null',
  tileSize: BASE_SIZE,
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



class Theme extends EventsBase {
  constructor (ctx) {
    super()
    this.artworks = {}
    this.tiles = {}
    this.tileLayers = {}
    this.ctx = ctx
  }

  async loadArtworks () {
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

    const enabledArtworks = settings.enabledArtworks.map(id => artworks[id]).filter(a => a)
    // enable system defaults
    if (artworks['jcz/simplified']) {
      enabledArtworks.push(artworks['jcz/simplified'])
    }
    const loaded = await (new ArtworkLoader()).loadArworks(enabledArtworks)

    this.artworks = loaded.artworks
    this.tiles = loaded.tiles
    this.tileLayers = {}
    this.ctx.app.store.commit('artworksLoaded')
    this.emit('load')
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
        clip: 'M 0 540 L 0 360 L 900 360 L 900 540 L 765 540 C 765 392 135 392 135 540 Z',
        point: [675, 450],
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
	  if (featureType == "Tunnel") {
		// Failback for old Addons
		const tunnelX = (loc == 'N' || loc == 'S') ? 500 : (loc == 'W' ? 250 : 750);
		const tunnelY = (loc == 'W' || loc == 'E') ? 500 : (loc == 'N' ? 250 : 750);
		return {
		  clip: {
            shape: "circle",
            cx: tunnelX,
            cy: tunnelY,
            r: 200
          },
          point: [
            tunnelX,
            tunnelY
          ],
          rotation: rotation
	    }
      }
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
      const locObj = loc && Location.parse(loc)
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
