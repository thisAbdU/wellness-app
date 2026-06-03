import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import en from './en.json';
import am from './am.json';

export const i18n = new I18n({ en, am });
i18n.enableFallback = true;

let locale = Localization.getLocales()[0]?.languageCode ?? 'en';
if (locale != 'en' && locale != 'am') {
    locale = 'am';
  }
i18n.locale = locale.startsWith('am') ? 'am' : 'en';