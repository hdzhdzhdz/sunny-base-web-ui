/**
 * @sunny-base-web/designer-materials
 *
 * 物料协议 — 描述组件的属性、事件、插槽、嵌套规则。
 * 连接组件库面板（左侧）和渲染器的桥梁。
 */

// 类型定义
export type {
  PropType,
  PropMeta,
  EventParamMeta,
  EventMeta,
  SlotMeta,
  NestingRules,
  Snippet,
  SnippetChild,
  ComponentCategory,
  ComponentMeta,
} from './types'

// 物料存储
export { MaterialStore } from './material-store'
