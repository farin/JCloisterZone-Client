<template>
  <g :data-tile-id="tileId">
    <component
      :is="layer.tag"
      v-for="(layer, idx) in layers"
      :key="idx"
      v-bind="layer.props"
    />
    <text
      v-if="!tile"
      x="150"
      y="480"
      :style="{ 'font-size': '128px', 'fill': 'red' }"
    >
      {{ tileId }}
    </text>
  </g>
</template>

<script>
import sortBy from 'lodash/sortBy'
import isString from 'lodash/isString'

const FEATURE_ORDER = {
  N: 10,
  NW: 11,
  NE: 12,
  W: 20,
  SW: 21,
  E: 30,
  S: 40,
  SE: 41,
  TOWER: 50,
  CLOISTER: 51
}

export default {
  props: {
    tileId: { type: String, required: true },
    rotation: { type: Number, default: 0 }
  },

  computed: {
    tile () {
      return this.$theme.getTile(this.tileId)
    },

    layers () {
      const { tile } = this
      if (!tile) {
        return []
      }

      const createLayer = (artwork, image, featureTransform, perspective, rotation) => {
        let href
        const transform = []
        if (image.href) {
          href = image.href
        } else {
          href = image
        }

        const svgRef = href[0] === '#' || href.includes('.svg#')
        let ratio = image.ratio
        if (svgRef && !ratio) {
          ratio = artwork.symbols[href.substring(1)]?.ratio
        }

        let y = 0
        let height = 1000
        if (ratio) {
          if (ratio[0] < ratio[1]) {
            height = ratio[1] / ratio[0] * 1000
            y = (1000 - height) / 2
          }
          if (ratio[0] > ratio[1]) {
            throw new Error('Not supported')
          }
        }

        const layer = {
          tag: svgRef ? 'use' : 'image',
          props: {
            width: 1000,
            height,
            y,
            href
          }
        }

        if (perspective === 'rotate' && rotation) {
          transform.push(`rotate(${rotation} 500 500)`)
        }
        if (featureTransform) {
          transform.push(featureTransform)
        }
        if (image.transform) {
          transform.push(image.transform)
        }
        if (transform.length) {
          layer.props.transform = transform.join(' ')
        }

        return layer
      }

      const getRecordForRotation = (obj, rotation) => {
        const rotKey = '@' + (rotation / 90)
        if (obj && obj[rotKey]) {
          obj = obj[rotKey]
        }
        return obj
      }

      const { artwork } = tile
      const layers = []

      if (tile.background) {
        const background = getRecordForRotation(tile.background, this.rotation)
        if (isString(background) || background.href) {
          const layer = createLayer(artwork, background, null, artwork.perspective, this.rotation)
          layer.order = 1
          layers.push(layer)
        }
      }

      // console.log(tile, tile.features)
      Object.entries(tile.features).forEach(([loc, f]) => {
        const perspective = f.perspective || artwork.perspective
        let r = this.rotation
        if (f.rotate) {
          r = (r + f.rotate) % 360
        }

        f = getRecordForRotation(f, r)

        const processImage = image => {
          const order = FEATURE_ORDER[loc]
          const layer = createLayer(artwork, image, f.transform, perspective, r)
          layer.order = order === undefined ? 9 : order
          layers.push(layer)
        }

        if (f.image) {
          processImage(f.image)
        }
        if (f.images) {
          f.images.forEach(img => processImage(img))
        }
      })

      if (tile.foreground) {
        const foreground = getRecordForRotation(tile.foreground, this.rotation)
        if (isString(foreground) || foreground.href) {
          const layer = createLayer(artwork, foreground, null, artwork.perspective, this.rotation)
          layer.order = 100
          layers.push(layer)
        }
      }

      return sortBy(layers, 'order')
    }
  }
}
</script>
