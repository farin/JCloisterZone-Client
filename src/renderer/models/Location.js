const edgeInstances = Object.create(null)

export default class Location {
  constructor (name, mask = null) {
    if (mask != null && mask === 0) throw new Error('Empty mask is not allowed')
    this.mask = mask
    this.name = name

    if (!this.name) {
      const parts = []
      Location.FIELD_SIDES.forEach(side => {
        if (this.intersect(side)) {
          parts.push(side.name)
        }
      })
      this.name = parts.join('.')
    }

    Object.freeze(this)
    if (mask !== null) {
      if (edgeInstances[mask]) throw new Error('Duplicate Location')
      edgeInstances[mask] = this
    }
  }

  /** Rotation about quarter circle clockwise */
  next () {
    return this.shift(2)
  }

  /** Rotation about quarter circle counter-clockwise */
  prev () {
    return this.shift(6)
  }

  /** Returns opposite location, mirrored by axis */
  rev () {
    // odd bits shift by 5, even by 3
    let mLo = this.mask & 255
    mLo = ((mLo & 85) << 5) | ((mLo & 170) << 3)
    mLo = (mLo | (mLo >> 8)) & 255

    let mHi = (this.mask & 65280) >> 8
    mHi = ((mHi & 85) << 5) | ((mHi & 170) << 3)
    mHi = (mHi | (mHi >> 8)) & 255

    return Location.get((this.mask & ~65535) | (mHi << 8) | mLo)
  }

  /**
   * Bitwise mask rotation about given number of bites.
   * @param i number of bites to rotate
   */
  shift (i) {
    let mLo = (this.mask & 255) << i
    mLo = (mLo | mLo >> 8) & 255

    let mHi = (this.mask & 65280) << i
    mHi = (mHi | mHi >> 8) & 65280

    return Location.get((this.mask & ~65535) | mHi | mLo)
  }

  /**
   * Relative rotations in counter-clockwise location
   * @param rotation degrees
   */
  rotateCCW (rotation) {
    if (this.mask === null) return this
    const ord = rotation / 90
    return this.shift((ord * 6) % 8)
  }

  /**
   * Relative rotations in clockwise location
   * @param rotation degrees
   */
  rotateCW (rotation) {
    if (this.mask === null) return this
    const ord = rotation / 90
    return this.shift(ord * 2)
  }

  getLeftFarm () {
    return Location.get((this.mask >> 8) & 85)
  }

  getRightFarm () {
    return Location.get((this.mask >> 8) & 170)
  }

  /** Checks if this is part of given location */
  isPartOf (loc) {
    if (this.mask === 0) return this === loc
    return ((this.mask ^ loc.mask) & this.mask) === 0
  }

  /** Merge two locations together */
  union (loc) {
    if (!loc) return this
    return Location.get(this.mask | loc.mask)
  }

  /** Subtract given location from this */
  subtract (loc) {
    return Location.get((~(this.mask & loc.mask)) & this.mask)
  }

  intersect (loc) {
    if (this === loc) return this
    if (!loc || this.mask === null || loc.mask === null || (this.mask & loc.mask) === 0) return null
    return Location.get(this.mask & loc.mask)
  }

  intersectMulti (locs) {
    const result = []
    locs.forEach(loc => {
      const item = this.intersect(loc)
      if (item) result.push(item)
    })
    return result
  }

  getRotationOf (loc) {
    return [0, 90, 180, 270].find(r => this.name === loc.rotateCW(r).name)
  }

  /**
   * Check if this rotated another location
   */
  isRotationOf (loc) {
    return !!this.getRotationOf(loc)
  }

  // assertion methods

  isFieldLocation () {
    return ((this.mask & 0x30000) | (this.mask & 0xFF)) > 0 || this === INNER_FIELD || this === INNER_FIELD_B
  }

  toString () {
    return this.name
  }

  static get (mask) {
    return edgeInstances[mask] || new Location(null, mask)
  }

  // Creates instance according to token delimuted by spaces or .
  static parse (names) {
    let result = null
    names.trim().split(/[\\.\s]+/).forEach(name => {
      const loc = name ? Location[name] : null
      if (loc) result = loc.union(result)
    })
    return result
  }
}

export const N = Location.N = new Location('N', 3 << 8) // North
export const W = Location.W = new Location('W', 192 << 8) // West
export const S = Location.S = new Location('S', 48 << 8) // South
export const E = Location.E = new Location('E', 12 << 8) // East

export const NW = Location.NW = new Location('NW', 195 << 8) // North-West
export const SW = Location.SW = new Location('SW', 240 << 8) // South-West
export const SE = Location.SE = new Location('SE', 60 << 8) // South East
export const NE = Location.NE = new Location('NE', 15 << 8) // North-East

export const WE = Location.WE = new Location('WE', 204 << 8) // Horizontal location - W + E
export const NS = Location.NS = new Location('NS', 51 << 8) // Vertical location -  N + S
export const NWSE = Location.NWSE = new Location('NWSE', 255 << 8) // All edges locations

export const _N = Location._N = new Location('_N', 252 << 8) // Supplement to the north
export const _W = Location._W = new Location('_W', 63 << 8) // Supplement to the west
export const _S = Location._S = new Location('_S', 207 << 8) // Supplement to the south
export const _E = Location._E = new Location('_E', 243 << 8) // Supplement to the east

export const INNER_CITY = Location.INNER_CITY = new Location('INNER_CITY') // Inner city
export const INNER_ROAD = Location.INNER_ROAD = new Location('INNER_ROAD') // Inner city
export const MONASTERY = Location.MONASTERY = new Location('MONASTERY') // Monastery on tile
export const MONASTERY_AS_ABBOT = Location.MONASTERY_AS_ABBOT = new Location('MONASTERY_AS_ABBOT')
export const TOWER = Location.TOWER = new Location('TOWER') // Tower on tile
// Flier location - follower can be placed here just for moment, befor dice roll
export const FLYING_MACHINE = Location.FLYING_MACHINE = new Location('FLYING_MACHINE')
export const QUARTER_CASTLE = Location.QUARTER_CASTLE = new Location('QUARTER_CASTLE')
export const QUARTER_MARKET = Location.QUARTER_MARKET = new Location('QUARTER_MARKET')
export const QUARTER_BLACKSMITH = Location.QUARTER_BLACKSMITH = new Location('QUARTER_BLACKSMITH')
export const QUARTER_CATHEDRAL = Location.QUARTER_CATHEDRAL = new Location('QUARTER_CATHEDRAL')

// farm locations
export const INNER_FIELD = Location.INNER_FIELD = new Location('INNER_FIELD') // Inner farm
export const INNER_FIELD_B = Location.INNER_FIELD_B = new Location('INNER_FIELD_B') // for tiles with two inner farms
export const NL = Location.NL = new Location('NL', 1)
export const NR = Location.NR = new Location('NR', 2)
export const EL = Location.EL = new Location('EL', 4)
export const ER = Location.ER = new Location('ER', 8)
export const SL = Location.SL = new Location('SL', 16)
export const SR = Location.SR = new Location('SR', 32)
export const WL = Location.WL = new Location('WL', 64)
export const WR = Location.WR = new Location('WR', 128)

Location.SIDES = Object.freeze([Location.N, Location.E, Location.S, Location.W])
Location.DIAGONAL_SIDES = Object.freeze([Location.NE, Location.SE, Location.SW, Location.NW])
Location.FIELD_SIDES = Object.freeze([Location.NL, Location.NR, Location.EL, Location.ER,
  Location.SL, Location.SR, Location.WL, Location.WR])
