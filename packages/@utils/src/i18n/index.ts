import { createI18n } from 'vue-i18n';
import type { App } from 'vue';
import type { I18n, I18nOptions } from 'vue-i18n';
import { computed } from 'vue';
import { reduce, set } from 'lodash-es'

export let i18n: I18n;
let messageLoader: ((locale: string) => Promise<any>) | null = null;

// Event bus for locale changes
const localeChangeCallbacks: Array<(locale: string) => void> = [];

export function onLocaleChange(fn: (locale: string) => void) {
  localeChangeCallbacks.push(fn);
}

export function registerMessageLoader(loader: (locale: string) => Promise<any>) {
  messageLoader = loader;
}

export const SUPPORT_LOCALES = ['zh-CN', 'en-US'] as const;
export type SupportedLocale = typeof SUPPORT_LOCALES[number];

export function setupI18n(app: App, options: I18nOptions) {
  i18n = createI18n(options);
  app.use(i18n);
  return i18n;
}

export async function setLocale(locale: SupportedLocale) {
  if (!i18n) return;

  // Load messages if loader is registered
  if (messageLoader) {
    try {
      const messages = await messageLoader(locale);
      if (messages) {
        i18n.global.setLocaleMessage(locale, messages);
      }
    } catch (error) {
      console.error(`Failed to load messages for locale: ${locale}`, error);
    }
  }

  const globalI18n = i18n.global;

  if (globalI18n.mode === 'legacy') {
    (globalI18n as any).locale = locale;
  } else {
    (globalI18n.locale as any).value = locale;
  }

  // Trigger callbacks
  for (const fn of localeChangeCallbacks) {
    await fn(locale);
  }

  // Optional: persist
  if (typeof window !== 'undefined') {
    localStorage.setItem('sunny-locale', locale);
  }
}

export const currentLocale = computed(() => {
  if (!i18n) return 'zh-CN';
  return i18n.global.mode === 'legacy' 
    ? (i18n.global as any).locale 
    : (i18n.global.locale as any).value;
});

// Helper to get t function outside components if needed
export function t(key: string, ...args: any[]) {
  if (!i18n) return key;
  return i18n.global.t(key, ...args);
}

// 转换接口返回的国际化数据为key-value格式
export function serverDataToClientData(serverDataStr: any) {
  const clientData = reduce(serverDataStr, function(result: any, value: any, key: string) {
    value.forEach((el: any) => {
      set(result, el.CKEY, el.CVALUE)
    })
    return result
  }, {})
  // console.log(clientData)
  return clientData
}