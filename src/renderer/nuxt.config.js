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
      // dark: true
      themes: {
        light: {
          primary: '#E64A19' // deep orange darken-2
        }
      }
    }
  }
}
