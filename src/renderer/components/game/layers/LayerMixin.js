import { mapGetters } from 'vuex'
import { BASE_SIZE } from '@/constants/ui'

export default {
  computed: mapGetters({
    bridges: 'game/bridges',
    colorCssClass: 'game/colorCssClass',
    isDragging: 'board/isDragging',
    tileOn: 'game/tileOn'
  }),

  methods: {
    positionAsKey (pos) {
      return `${pos[0]},${pos[1]}`
    },

    pointerAsKey (ptr) {
      if (ptr?.length === 3) {
        return ptr.join(',')
      }
      return `${ptr.position[0]},${ptr.position[1]},${ptr.feature}/${ptr.location}`
    },

    getX (pos) {
      return pos[0] * BASE_SIZE
    },

    getY (pos) {
      return pos[1] * BASE_SIZE
    },

    getTilePoint ({ position, feature, location }) {
      const tile = this.tileOn(position)
      const featureObj = this.$theme.getFeature(tile, feature, location, this.bridges)
      return {
        tile,
        point: featureObj.point,
        rotation: featureObj.rotation,
        transform: featureObj.transform,
        inverseScaleTransform: featureObj.inverseScaleTransform
      }
    },

    transformPosition (pos) {
      return `translate(${this.getX(pos)} ${this.getY(pos)})`
    },

    transformRotation (rot) {
      const c = BASE_SIZE / 2
      return `rotate(${rot} ${c} ${c})`
    },

    transformPoint (ptr) { // ptr is { position, feature, location }
      const { tile, point, rotation, transform, inverseScaleTransform } = this.getTilePoint(ptr)
      if (!point) {
        console.warn('Point not defined', ptr)
        return ''
      }
      return `${this.transformPosition(tile.position)} ${this.transformRotation(rotation)} ${transform || ''} translate(${point[0]} ${point[1]}) rotate(${-rotation} 0 0) ${inverseScaleTransform || ''}`
    },

    transformTunnelEnd (ptr) {
      const { position, location } = ptr

      const tile = this.tileOn(position)
      const feature = this.$theme.getFeature(tile, 'Tunnel', location, [])
      const { point, rotation, transform, inverseScaleTransform } = feature
      return `${this.transformPosition(tile.position)} ${this.transformRotation(rotation)} ${transform || ''} translate(${point[0]} ${point[1]}) rotate(${-rotation} 0 0) ${inverseScaleTransform || ''}`
    }
  }
}
