/**
 * By default, Nuxt.js is configured to cover most use cases.
 * This default configuration can be overwritten in this file
 * @link {https://nuxtjs.org/guide/configuration/}
 */
module.exports = {
  mode: 'spa', // or 'universal'
  head: {
    title: 'JCloisterZone'
  },
  loading: false,
  plugins: [
    // '~/plugins/portal-vue',
    '~/plugins/engine',
    '~/plugins/server',
    '~/plugins/connection',
    '~/plugins/tiles',
    '~/plugins/theme',
    { ssr: true, src: '@/plugins/icons.js' }
  ],
  buildModules: [

  ],
  modules: [
    '@nuxtjs/vuetify',
    '@nuxtjs/style-resources'
  ],

  styleResources: {
    sass: './assets/styles/shared.sass'
  },

  vuetify: {
    // https://medium.com/untitled-factory/changing-default-font-in-vuetify-js-and-nuxt-js-3894e726ff10
    // uncomment to change font
    // customVariables: ['~/assets/variables.scss'],
    // treeShake: true,

    theme: {
      themes: {
        light: {
          primary: '#E64A19' // deep orange darken-2
        },
        dark: {
          primary: '#E64A19' // deep orange darken-2
        }
      }
    }
  },

  build: {
    loaders: {
      vue: {
        transformAssetUrls: {
          audio: 'src'
        }
      }
    },

    extend(config, ctx) {
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      })
    }
  }
}
