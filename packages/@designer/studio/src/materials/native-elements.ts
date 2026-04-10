/**
 * 原生 HTML 元素物料定义
 *
 * div/span/p/h1-h6 等原生标签，component 为标签名字符串。
 * Vue 的 h() 函数直接接受字符串标签名，渲染器无需额外处理。
 */
import { markRaw, type Component } from 'vue'
import type { ComponentMeta, EventParamMeta } from '@sunny-base-web/designer-materials'

const clickEventParams: EventParamMeta[] = [
  { name: 'event', type: 'MouseEvent', description: '鼠标事件' },
]

const nativeElements: Array<{
  tag: string
  title: string
  isContainer: boolean
}> = [
  { tag: 'div', title: '容器', isContainer: true },
  { tag: 'span', title: '行内文本', isContainer: true },
  { tag: 'p', title: '段落', isContainer: true },
  { tag: 'h1', title: '标题 1', isContainer: false },
  { tag: 'h2', title: '标题 2', isContainer: false },
  { tag: 'h3', title: '标题 3', isContainer: false },
  { tag: 'h4', title: '标题 4', isContainer: false },
  { tag: 'h5', title: '标题 5', isContainer: false },
  { tag: 'h6', title: '标题 6', isContainer: false },
]

export function createNativeElementMetas(): ComponentMeta[] {
  return nativeElements.map(({ tag, title, isContainer }) => ({
    name: tag,
    title,
    component: markRaw(tag) as unknown as Component,
    isNativeElement: true,
    category: 'layout' as const,
    group: '原生元素',
    order: 100,
    props: [
      { name: 'class', title: '类名', type: 'string' as const, group: '基础属性' },
      { name: 'style', title: '样式', type: 'json' as const, group: '基础属性' },
    ],
    events: [
      { name: 'click', title: '点击', params: clickEventParams },
    ],
    slots: [
      { name: 'default', title: '默认插槽' },
    ],
    nestingRules: { isContainer },
    snippets: [
      { title, props: {} },
    ],
  }))
}
