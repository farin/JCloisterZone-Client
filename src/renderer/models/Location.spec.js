/* eslint no-unused-vars: 0 */
// import { assert } from 'chai'
// import Location, {
//   N, W, S, E,
//   NW, NE, SW, SE, WE, NS, NWSE, INNER_FARM, INNER_FARM_B, CLOISTER,
//   _N, _S, _W, _E,
//   NR, NL, EL, ER, SL, SR, WL, WR
// } from 'models/Location'

// describe("Location", function() {
//   it('get() should return proper instances', function() {
//     assert.equal(Location.get(3 << 8).name, 'N')
//   })

//   it('next() should rotate Location clocwise', function() {
//     assert.equal(E, N.next())
//     assert.equal(N, W.next())
//   })

//   it('isPartOf()', function() {
//     assert.isTrue(E.isPartOf(E))
//     assert.isTrue(N.isPartOf(NW))
//     assert.isFalse(E.isPartOf(NW))
//     assert.isFalse(INNER_FARM.isPartOf(N))
//     assert.isTrue(_N.isPartOf(NWSE))
//   })

//   it('union()', function() {
//     assert.equal(S.union(W), SW)
//     assert.equal(W.union(S), SW)
//     assert.equal(N.union(_N), NWSE)
//   })

//   it("union() shouldn't accept incomaptible locations", function() {
//     //TODO
//     //N.union(CLOISTER)
//     //N.union(INNER_FARM)
//   })

//   it('substract()', function() {
//     assert.equal(SW.substract(W), S)
//     assert.equal(SW.substract(S), W)
//     assert.equal(NWSE.substract(_N), N)
//   })

//   it("substract() shouldn't accept incomaptible locations", function() {
//     //TODO
//     //N.substract(CLOISTER)
//   })

//   it('rev()', function() {
//     assert.equal(N.rev(), S)
//     assert.equal(SR.rev(), NL)
//     assert.equal(SE.rev(), NW)
//     assert.equal(_S.rev(), _N)
//     let l1 = NL.union(NR.union(EL))
//     let l2 = SL.union(SR.union(WR))
//     assert.equal(l2.rev(), l1)
//   })

//   it('rotate', function() {
//     assert.equal(N.rotateCW(R90), E)
//     assert.equal(N.rotateCCW(R90), W)
//     assert.equal(E.rotateCW(R180), W)
//     assert.equal(S.rotateCCW(R0), S)
//   })

//   it('isRotationOf', function() {
//     assert.isTrue(E.isRotationOf(E))
//     assert.isTrue(E.isRotationOf(N))
//     assert.isTrue(N.isRotationOf(E))
//     assert.isTrue(_N.isRotationOf(_S))
//     assert.isTrue(NW.isRotationOf(NE))
//   })

//   it('getRotationOf', function() {
//     assert.equal(E.getRotationOf(E), R0)
//     assert.equal(E.getRotationOf(N), R90)
//     assert.equal(S.getRotationOf(W), R270)
//   })

//   it('intersect()', function() {
//     assert.equal(E, E.intersect(E))
//     assert.isNull(E.intersect(W))
//     assert.equal(E, WE.intersect(SE))
//     assert.isNull(NW.intersect(NR.union(EL)))
//   })
// })
