import DefaultTheme from 'vitepress/theme'
import { ElementPlusContainer } from '@vitepress-demo-preview/component'
import PreviewWrapper from './PreviewWrapper.vue'
import '@vitepress-demo-preview/component/dist/style.css'
import '@arco-design/web-vue/dist/arco.css'
import ArcoVue from '@arco-design/web-vue'
import { KunkkaIcon, KunkkaSearchInputTag, KunkkaBatchSelect, KunkkaSelect } from '@kunkka/ui'

import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    const { app } = ctx;
    app.component('demo-preview', PreviewWrapper)
    app.component('ElementPlus', PreviewWrapper)
    app.component('KunkkaIcon', KunkkaIcon)
    app.component('KunkkaSearchInputTag', KunkkaSearchInputTag)
    app.component('KunkkaBatchSelect', KunkkaBatchSelect)
    app.component('KunkkaSelect', KunkkaSelect)
    app.use(ArcoVue)
  }
}
