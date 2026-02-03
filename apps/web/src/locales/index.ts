import type { App } from 'vue';

import type { LocaleSetupOptions, SupportedLanguagesType } from '@sunny-base-web/locales';

import { preferences } from '#/preferences';

import { ref } from 'vue';

import {
  $t,
  setupI18n as coreSetup,
  loadLocalesMapFromDir,
} from '@sunny-base-web/locales';

import arcoEnLocale from '@arco-design/web-vue/es/locale/lang/en-us';
import arcoDefaultLocale from '@arco-design/web-vue/es/locale/lang/zh-cn';

const arcoLocale = ref<any>(arcoDefaultLocale);

const modules = import.meta.glob('./langs/**/*.json');

const localesMap = loadLocalesMapFromDir(
  /\.\/langs\/([^/]+)\/(.*)\.json$/,
  modules,
);
/**
 * 加载应用特有的语言包
 * 这里也可以改造为从服务端获取翻译数据
 * @param lang
 */
async function loadMessages(lang: SupportedLanguagesType) {
  const [appLocaleMessages] = await Promise.all([
    localesMap[lang]?.(),
    loadThirdPartyMessage(lang),
  ]);
  return appLocaleMessages?.default;
}

/**
 * 加载第三方组件库的语言包
 * @param lang
 */
async function loadThirdPartyMessage(lang: SupportedLanguagesType) {
  await Promise.all([loadArcoLocale(lang)]);
}

/**
 * 加载arco的语言包
 * @param lang
 */
async function loadArcoLocale(lang: SupportedLanguagesType) {
  switch (lang) {
    case 'en-US': {
      arcoLocale.value = arcoEnLocale;
      break;
    }
    case 'zh-CN': {
      arcoLocale.value = arcoDefaultLocale;
      break;
    }
  }
}

async function setupI18n(app: App, options: LocaleSetupOptions = {}) {
  await coreSetup(app, {
    defaultLocale: preferences.app.locale,
    loadMessages,
    missingWarn: !import.meta.env.PROD,
    ...options,
  });
}

export { $t, arcoLocale, setupI18n };
