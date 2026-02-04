import DefaultTheme from 'vitepress/theme'
import { ElementPlusContainer } from '@vitepress-demo-preview/component'
import PreviewWrapper from './PreviewWrapper.vue'
import '@vitepress-demo-preview/component/dist/style.css'
import '@arco-design/web-vue/dist/arco.css'
import ArcoVue from '@arco-design/web-vue'
import { SunnyIcon, SunnySearchInputTag, SunnyBatchSelect, SunnySelect } from '@sunny-base-web/ui'

import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    const { app } = ctx;
    app.component('demo-preview', PreviewWrapper)
    app.component('ElementPlus', PreviewWrapper)
    app.component('SunnyIcon', SunnyIcon)
    app.component('SunnySearchInputTag', SunnySearchInputTag)
    app.component('SunnyBatchSelect', SunnyBatchSelect)
    app.component('SunnySelect', SunnySelect)
    app.use(ArcoVue)
  }
}
