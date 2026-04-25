/**
 * 内置 Widget 定义
 *
 * 提供 Pages（页面管理）和 Components（组件库）两个核心 Widget。
 * 在设计器初始化时通过 createBuiltinWidgets() 创建并注册到 WidgetRegistry。
 *
 * @example
 * ```ts
 * const registry = new WidgetRegistry()
 * registry.registerAll(createBuiltinWidgets())
 * // 注册了 'pages' 和 'components' 两个 panel 类型 Widget
 * ```
 */
import type { Widget } from './types'
import IconFile from '@arco-design/web-vue/es/icon/icon-file'
import IconApps from '@arco-design/web-vue/es/icon/icon-apps'
import PagesWidget from './pages/PagesWidget.vue'
import ComponentsWidget from './components/ComponentsWidget.vue'

/**
 * 创建内置 Widget 列表
 *
 * @returns 包含 Pages 和 Components 两个 Widget 的数组
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
