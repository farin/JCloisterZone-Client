import ohm from 'ohm-js'
import { Path, Point } from 'paper/dist/paper-core'

import PathTemplateGrammar from './shape-template.ohm'

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
      ShapeElement (a, b, c, d) {
        return { expr: false, refs: [] }
      },

      PathTemplate (f1, expr, f2) {
        return expr.getRefs()
      },

      _iter (...args) {
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

      var_transform (name, pipeOp, transform) {
        return name.getRefs()
      }
    })
    .addOperation('eval', {
      ShapeElement (a, b, c, d) {
        return this.sourceString
      },

      PathTemplate (f1, expr, f2) {
        return f1.sourceString + expr.eval() + f2.eval()
      },

      _iter (...args) {
        // console.log(this)
        return args.map(a => a.eval()).join(' ')
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

      var_transform (name, pipeOp, transform) {
        const p = asPath(name.eval())
        const t = transform.eval()
        return t(p)
      },

      t_translate (a, x, c, d, y, f) {
        return p => p.translate(new Point(x, y))
      },

      t_rotate (a, rot, c) {
        return p => p.rotate(~~rot.sourceString, center)
      },

      t_mirror (a, axis, c) {
        if (axis.sourceString === 'y') {
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
        let feature = loader.features[id]
        if (rotKey !== undefined) {
          // TODO clip can be on parent, also clip-rotate may be used
          feature = feature['@' + rotKey]
        }

        if (!feature) {
          console.error(`Unknown ref ${ref}`)
          return ''
        }

        return feature.clip
      }
    })
}
