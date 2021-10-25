import ohm from 'ohm-js'
import PathTemplateGrammar from './shape-template.ohm'

export const grammar = ohm.grammar(PathTemplateGrammar)

export function createSemantics (loader) {
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

      literal (a, b, c) {
        return []
      },

      path_ref (a, b, c, d) {
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
        // if (loader.vars[body.sourceString]) {
        //   console.log('>>>' + loader.vars[body.sourceString])
        // }
        // return ` ###${body.sourceString}### `
        return body.eval()
      },

      path_ref (a, b, c, d) {
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
