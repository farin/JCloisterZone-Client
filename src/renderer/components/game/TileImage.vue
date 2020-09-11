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

const ZINDEX = {
  'N': 10,
  'NW': 11,
  'NE': 12,
  'W': 20,
  'SW': 21,
  'E': 30,
  'S': 40,
  'SE': 41,
  'TOWER': 50,
  'CLOISTER': 51
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

      const createLayer = (image, featureTransform, perspective, rotation) => {
        let href
        const transform = []
        if (image.href) {
          href = image.href
        } else {
          href = image
        }
        const svgRef = href.includes('.svg#')
        const layer = {
          tag: svgRef ? 'use' : 'image',
          props: {
            width: '1000',
            height: '1000',
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
          const layer = createLayer(background, null, artwork.perspective, this.rotation)
          layer.z = 1
          layers.push(layer)
        }
      }

      Object.entries(tile.features).forEach(([loc, f]) => {
        const perspective = f.perspective || artwork.perspective
        let r = this.rotation
        if (f.rotate) {
          r = (r + f.rotate) % 360
        }

        f = getRecordForRotation(f, r)
        if (f.image) {
          const z = ZINDEX[loc]
          const layer = createLayer(f.image, f.transform, perspective, r)
          layer.z = z === undefined ? 9 : z
          layers.push(layer)
        }
      })

      if (tile.foreground) {
        const foreground = getRecordForRotation(tile.foreground, this.rotation)
        if (isString(foreground) || foreground.href) {
          const layer = createLayer(foreground, null, artwork.perspective, this.rotation)
          layer.z = 100
          layers.push(layer)
        }
      }

      sortBy(layers, 'z')
      return layers
    }
  }
}
</script>
