import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n/index.js'

const i18n = createI18n({
  globalInjection: true,
  messages,
  legacy: false,
  fallbackLocale: 'zh-TW',
  locale: 'zh-TW',
  missing: (locale, key) => {
    console.warn(`Missing translation key: ${key} in locale: ${locale}`);
  }
});

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n);
});

// Export the i18n instance
export { i18n };
