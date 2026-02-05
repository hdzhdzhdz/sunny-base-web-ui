import DefaultTheme from 'vitepress/theme'
import { ElementPlusContainer } from '@vitepress-demo-preview/component'
import PreviewWrapper from './PreviewWrapper.vue'
import '@vitepress-demo-preview/component/dist/style.css'
import '@arco-design/web-vue/dist/arco.css'
import ArcoVue from '@arco-design/web-vue'
import { SunnyIcon, SunnySearchInputTag, SunnyBatchSelect, SunnySelect } from '@sunny-base-web/ui'
import mediumZoom from 'medium-zoom'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'

import './style.css'

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()
    const initZoom = () => {
      // mediumZoom('[data-zoomable]', { background: 'var(--vp-c-bg)' });
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' })
    }
    onMounted(() => {
      initZoom()
    })
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    )
  },
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
