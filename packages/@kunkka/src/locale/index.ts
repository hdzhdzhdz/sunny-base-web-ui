import { ref, computed } from 'vue';
import { onLocaleChange } from '@sunny-base-web/utils';
import VxeUI from 'vxe-pc-ui';

// Import Arco locales
import arcoZhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
import arcoEnUS from '@arco-design/web-vue/es/locale/lang/en-us';

// Import Vxe locales
import vxeZhCN from 'vxe-pc-ui/lib/language/zh-CN';
import vxeEnUS from 'vxe-pc-ui/lib/language/en-US';

// Map for Arco
const arcoLocales: Record<string, any> = {
  'zh-CN': arcoZhCN,
  'en-US': arcoEnUS,
};

const currentArcoLocale = ref(arcoLocales['zh-CN']);

// Register Vxe locales
VxeUI.setI18n('zh-CN', vxeZhCN);
VxeUI.setI18n('en-US', vxeEnUS);
// Set default
VxeUI.setLanguage('zh-CN');

// Listen to locale changes from @utils
onLocaleChange((locale) => {
  // Update Arco
  if (arcoLocales[locale]) {
    currentArcoLocale.value = arcoLocales[locale];
  }
  
  // Update Vxe
  // Ensure the locale string matches what Vxe expects (zh-CN, en-US match)
  VxeUI.setLanguage(locale);
});

export function useArcoLocale() {
  return {
    locale: currentArcoLocale
  };
}
