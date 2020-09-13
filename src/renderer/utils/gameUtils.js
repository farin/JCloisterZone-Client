
export function isSameFeature (f1, f2) {
  return f1.position[0] === f2.position[0] && f1.position[1] === f2.position[1] && f1.location === f2.location
}

export function getMeeplePlayer (meepleId) {
  return parseInt(meepleId.split('.')[0])
}
