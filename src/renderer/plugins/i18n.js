import { ipcRenderer } from 'electron'

// hint meta keys as used to extractor
// $t('@author')
// $t('@jcz-version')
// $t('@version')

export default function ({ app }) {
  app.i18n.onLanguageSwitched = (oldLocale, newLocale) => {
    const messages = app.i18n.getLocaleMessage(newLocale)
    ipcRenderer.invoke('translate-menu', messages.menu)
  }
}
