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
    '~/plugins/date-format',
    '~/plugins/i18n.js'
  ],
  buildModules: [
    '@nuxtjs/style-resources'
  ],
  modules: [
    '@nuxtjs/vuetify',
    '@nuxtjs/i18n'
  ],

  styleResources: {
    sass: './assets/styles/shared.sass'
  },

  i18n: {
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
    locales: [
      {
        code: 'en',
        file: 'en.json'
      },
      {
        code: 'cs',
        file: 'cs.json'
      },
      {
        code: 'sk',
        file: 'sk.json'
      }
    ],
    // lazy: true,
    langDir: 'locales/',
    defaultLocale: 'en'
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
    }
  }
}
