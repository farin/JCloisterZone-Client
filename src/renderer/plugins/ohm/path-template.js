import isObject from 'lodash/isObject'
import zip from 'lodash/zip'
import ohm from 'ohm-js'
import { Path, Point } from 'paper/dist/paper-core'
import { kForOnEventAttribute } from 'ws/lib/constants'

import PathTemplateGrammar from './path-template.ohm'

export const grammar = ohm.grammar(PathTemplateGrammar)

function asPath (p) {
  return (p instanceof Path) ? p : new Path(p)
}

function exportPath (p) {
  const el = p.exportSVG()
  return el.getAttribute('d')
}

export function createSemantics (loader, artwork) {
  const center = new Point(artwork.tileSize / 2, artwork.tileSize / 2)

  return grammar.createSemantics()
    .addOperation('getRefs', {
      PathTemplate (f1, expr, f2) {
        return expr.getRefs()
      },

      _iter (...args) {
        // used only for PathTemplate expr, TODO move ites impl there
        const r = { expr: false, refs: [] }
        args.forEach(a => {
          const { expr, refs } = a.getRefs()
          r.expr ||= expr
          r.refs.push(...refs)
        })
        return r
      },

      Expr (ppen, body, close) {
        return { expr: true, refs: body.getRefs() }
      },

      ExprBody_union (a, op, b) {
        return [...a.getRefs(), ...b.getRefs()]
      },

      ExprBody_difference (a, op, b) {
        return [...a.getRefs(), ...b.getRefs()]
      },

      ExprBody_intersection (a, op, b) {
        return [...a.getRefs(), ...b.getRefs()]
      },

      ExprBody_join (a, op, b) {
        return [...a.getRefs(), ...b.getRefs()]
      },

      literal (a, b, c) {
        return []
      },

      path_ref (a, b, c) {
        return [this.sourceString]
      },

      variable (name, op, transform) {
        return name.getRefs()
      }
    })
    .addOperation('eval', {
      PathFragment (a) {
        return this.sourceString
      },

      PathTemplate (f1, expr, f2) {
        const tail = zip(expr.eval(), f2.eval()).map(([a, b]) => {
          return ` ${a} ${b}`
        }).join('')
        return f1.sourceString + tail
      },

      _iter (...args) {
        return args.map(a => a.eval())
      },

      _terminal () {
        return this.sourceString
      },

      Expr (open, body, close) {
        const res = body.eval()
        return typeof res === 'string' ? res : exportPath(res)
      },

      ExprBody_union (a, op, b) {
        const p1 = asPath(a.eval())
        const p2 = asPath(b.eval())
        return p1.unite(p2)
      },

      ExprBody_difference (a, op, b) {
        const p1 = asPath(a.eval())
        const p2 = asPath(b.eval())
        return p1.subtract(p2)
      },

      ExprBody_intersection (a, op, b) {
        const p1 = asPath(a.eval())
        const p2 = asPath(b.eval())
        return p1.intersect(p2)
      },

      ExprBody_join (a, op, b) {
        const p1 = asPath(a.eval())
        const p2 = asPath(b.eval())
        return p1.join(p2)
      },

      variable (name, op, transform) {
        const n = name.eval()
        const ops = transform.eval()
        if (!ops.length) {
          return n
        }
        const p = asPath(n)
        return ops.reduce((p, t) => t(p), p)
      },

      t_reverse (a) {
        return p => { p.reverse(); return p }
      },

      t_translate (a, x, c, d, y, f) {
        x = ~~x.sourceString
        y = ~~y.sourceString
        return p => p.translate(new Point(x, y))
      },

      t_rotate (a, rot, c) {
        return p => p.rotate(~~rot.sourceString, center)
      },

      t_mirror (a, axis, c) {
        if (axis.sourceString === 'x') {
          return p => p.scale(-1, 1, center)
        } else {
          return p => p.scale(1, -1, center)
        }
      },

      literal (a, b, c) {
        return this.sourceString
      },

      path_ref (a, b, c) {
        const ref = this.sourceString
        if (loader.vars[ref]) {
          return loader.vars[ref]
        }

        const [id, rotKey] = ref.split('@')
        const root = loader.features[id]
        let feature = root
        if (rotKey !== undefined) {
          // clip-rotate may be also used, TODO apply it
          feature = feature['@' + rotKey]
        }

        if (!feature) {
          console.error(`Unknown ref ${ref}`)
          return ''
        }

        let clip = feature.clip || root.clip
        if (isObject(clip)) {
          // https://stackoverflow.com/questions/5737975/circle-drawing-with-svgs-arc-path
          if (clip.shape === 'circle') {
            const { cx, cy, r} = clip
            return `M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 -${r * 2},0 Z`
          }
          if (clip.shape === 'ellipse') {
            const { cx, cy, rx, ry} = clip
            return `M${cx - rx},${cy}a${rx},${ry} 0 1,0 ${rx * 2},0a${rx},${ry} 0 1,0 -${rx * 2},0 Z`
          }
          console.error('Only path, cicle or ellopse can be referenced from path expression')
          return ''
        }

        if (feature.transform) {
          clip = asPath(clip)
          const m = /translate\((-?\d+),\s*(-?\d+)\)/.exec(feature.transform)
          if (m) {
            clip = clip.translate(new Point(~~m[1], ~~m[2]))
          } else {
            console.error(`unimplemented transform (when rerefenced as ${ref}`)
          }
        }

        return clip
      }
    })
}
