import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import CommonConstants from '../modules/constants.common.js'
import AsyncStorage from '@react-native-async-storage/async-storage'

import enUS from './en.json'
import mmMM from './mm.json'
import mmZG from './zg.json'

i18next
    .use(initReactI18next)
    .init({
        lng: 'mm',
        fallbackLng: 'mm',
        resources: {
            'en': {
                translation: enUS
            },
            'mm': {
                translation: mmMM
            },
            'zg': {
                translation: mmZG
            },
            interpolation: {
                escapeValue: false 
            }
        }
    })

AsyncStorage.multiGet([
    CommonConstants.PERSISTENT_STORAGE_KEY.LANGUAGE
]).then((storedData) => {
    if(storedData) {
        let lang = storedData[0][1]
        
        if(lang) {
            i18next.changeLanguage(lang)
        }
    }
})

export default i18next;