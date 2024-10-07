import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  debug: true,
  react: {
    wait: true,
    useSuspense: false,
  },
})

const localeAssets = ['common']
for (const asset of localeAssets) {
  import(`../public/locales/en/${asset}.json`)
    .then((resources) => {
      i18n.addResourceBundle('en', asset, resources.default)
    })
    .catch((error) => {
      console.error(`Failed to load resource bundle: ${asset}`, error)
    })
}

export default i18n
