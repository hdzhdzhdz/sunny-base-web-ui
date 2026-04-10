/**
 * 内置 Widget 定义
 *
 * 提供 Pages 和 Components 两个核心 Widget。
 * 通过 createBuiltinWidgets(materialStore) 创建并注册到 WidgetRegistry。
 */
import type { Widget } from './types'
import IconFile from '@arco-design/web-vue/es/icon/icon-file'
import IconApps from '@arco-design/web-vue/es/icon/icon-apps'
import PagesWidget from './pages/PagesWidget.vue'
import ComponentsWidget from './components/ComponentsWidget.vue'

/**
 * 创建内置 Widget 列表
 */
export function createBuiltinWidgets(): Widget[] {
  return [
    {
      name: 'pages',
      icon: IconFile,
      title: '页面管理',
      component: PagesWidget,
      openType: 'panel',
      order: 1,
      region: 'apps',
    },
    {
      name: 'components',
      icon: IconApps,
      title: '组件库',
      component: ComponentsWidget,
      openType: 'panel',
      order: 2,
      region: 'apps',
    },
  ]
}
