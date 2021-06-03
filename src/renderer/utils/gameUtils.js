import compareVersions from 'compare-versions'

export function isSameFeature (f1, f2) {
  return f1.position[0] === f2.position[0] && f1.position[1] === f2.position[1] && f1.location === f2.location
}

export function getMeeplePlayer (meepleId) {
  return parseInt(meepleId.split('.')[0])
}

export function migrateLegacyReplay (sourceAppVersion, replay) {
  const GARDEN_TILES = ['BA/CG', 'BA/CCG', 'BA/CFCG', 'BA/Cc+G', 'BA/CcG', 'BA/CccG', 'BA/RFrG', 'BA/RrG', 'IC/CCCCG', 'IC/RFr.iG', 'TB/CcR.cG', 'TB/CcRR.wG', 'DG/C.dG', 'DG/Cc.pG', 'TO/FG', 'TO/RRG', 'AM/RG', 'BB/CFR!G', 'HS/RR.hG', 'KR/RCG', 'RI.1/IIG', 'RI.2/IIG', 'FL/F.dG', 'MW/CCRrG', 'SD/RRRG']

  if (compareVersions.compare(sourceAppVersion, '5.7.0', '<')) {
    let lastTile = null
    replay = JSON.parse(JSON.stringify(replay)) // make copy
    replay.forEach(({ type, payload }) => {
      if (type === 'PLACE_TILE') {
        lastTile = payload.tileId
      }
      const { pointer } = payload
      if (pointer?.location === 'INNER_FARM') {
        pointer.location = 'INNER_FIELD'
      } else if (pointer?.location === 'MONASTERY') {
        pointer.location = 'MONASTERY_AS_ABBOT'
      } else if (pointer?.location === 'CLOISTER') {
        if (GARDEN_TILES.includes(lastTile)) {
          pointer.location = 'GARDEN'
        } else {
          pointer.location = 'MONASTERY'
        }
      }
    })
    console.log(replay)
  }
  return replay
}
