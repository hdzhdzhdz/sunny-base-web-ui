import DefaultTheme from 'vitepress/theme'
import { ElementPlusContainer } from '@vitepress-demo-preview/component'
import '@vitepress-demo-preview/component/dist/style.css'
import 'element-plus/dist/index.css'
import '@arco-design/web-vue/dist/arco.css'
import ArcoVue from '@arco-design/web-vue'
import { KunkkaIcon } from '@kunkka/ui'

import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    const { app } = ctx;
    app.component('demo-preview', ElementPlusContainer)
    app.component('KunkkaIcon', KunkkaIcon)
    app.use(ArcoVue)
  }
}
