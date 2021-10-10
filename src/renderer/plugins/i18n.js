import { ipcRenderer } from 'electron'

export default function ({ app }) {
  app.i18n.onLanguageSwitched = (oldLocale, newLocale) => {
    const messages = app.i18n.getLocaleMessage(newLocale)
    ipcRenderer.invoke('translate-menu', messages.menu)
  }
}
