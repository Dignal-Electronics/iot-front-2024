import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: localStorage.theme ?? 'lightMode',
    themes: {
      lightMode: {
        dark: false
      },
      darkMode: {
        dark: true
      }
    }
  },
  defaults: {
    VBtn: {
      color: '#880E4F'
    },
    VTextField: {
      variant: 'outlined',
      color: 'pink-lighten-3'
    }
  }
})

export default vuetify;