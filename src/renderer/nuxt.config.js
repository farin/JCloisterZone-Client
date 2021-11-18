/**
 * By default, Nuxt.js is configured to cover most use cases.
 * This default configuration can be overwritten in this file
 * @link {https://nuxtjs.org/guide/configuration/}
 */
module.exports = {
  ssr: false,
  head: {
    title: 'JCloisterZone',
    meta: [
      { charset: 'utf-8' }
    ]
  },
  loading: false,
  plugins: [
    // '~/plugins/portal-vue',
    '~/plugins/engine',
    '~/plugins/server',
    '~/plugins/connection',
    '~/plugins/addons',
    '~/plugins/tiles',
    '~/plugins/theme',
    { ssr: true, src: '@/plugins/icons.js' },
    '~/plugins/router-patch',
    '~/plugins/date-format'
  ],
  buildModules: [
    '@nuxtjs/style-resources'
  ],
  modules: [
    '@nuxtjs/vuetify'
  ],

  styleResources: {
    sass: './assets/styles/shared.sass'
  },

  vuetify: {
    // https://medium.com/untitled-factory/changing-default-font-in-vuetify-js-and-nuxt-js-3894e726ff10
    // uncomment to change font
    // customVariables: ['~/assets/variables.scss'],
    // treeShake: true,

    defaultAssets: {
      font: false,
      icons: 'fa'
    },

    theme: {
      options: { customProperties: true },
      themes: {
        light: {
          primary: '#E64A19' // deep orange darken-2
        },
        dark: {
          primary: '#EF6C00' // orange darken-3
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

    extend (config, ctx) {
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      })

      config.module.rules.push({
        test: /\.ohm$/i,
        loader: 'raw-loader'
      })

      // https://github.com/yan-foto/electron-reload/issues/71
      config.externals = {
        fsevents: "require('fsevents')"
      }
    }
  }
}
