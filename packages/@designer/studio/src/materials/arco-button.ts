/**
 * Arco Design Button 物料定义
 *
 * 为 Arco Design Vue 的 Button 组件提供设计器所需的元数据，
 * 包括属性 schema、事件定义、插槽定义和拖拽 snippets。
 *
 * ## 属性面板字段
 *
 * | 属性 | 类型 | 默认值 | 说明 |
 * |------|------|--------|------|
 * | type | select | 'primary' | 按钮类型（primary/secondary/outline/dashed/text） |
 * | size | select | 'medium' | 尺寸（mini/small/medium/large） |
 * | status | select | - | 状态（normal/warning/danger/success） |
 * | disabled | boolean | false | 是否禁用 |
 * | long | boolean | false | 是否撑满父容器 |
 *
 * @example
 * ```ts
 * const meta = createArcoButtonMeta()
 * // meta.name === 'a-button'
 * // meta.component === Arco Button 组件
 * ```
 */
import { markRaw } from 'vue'
import type { ComponentMeta } from '@sunny-base-web/designer-materials'
import { Button } from '@arco-design/web-vue'

/** 创建 Arco Button 的 ComponentMeta */
export function createArcoButtonMeta(): ComponentMeta {
  return {
    name: 'a-button',
    title: 'Arco 按钮',
    component: markRaw(Button),
    category: 'basic',
    group: 'Arco 组件',
    order: 10,
    props: [
      {
        name: 'type',
        title: '类型',
        type: 'select',
        options: [
          { label: '主要', value: 'primary' },
          { label: '次要', value: 'secondary' },
          { label: '轮廓', value: 'outline' },
          { label: '虚线', value: 'dashed' },
          { label: '文字', value: 'text' },
        ],
        defaultValue: 'primary',
        group: '基础属性',
      },
      {
        name: 'size',
        title: '尺寸',
        type: 'select',
        options: [
          { label: '迷你', value: 'mini' },
          { label: '小', value: 'small' },
          { label: '中', value: 'medium' },
          { label: '大', value: 'large' },
        ],
        defaultValue: 'medium',
        group: '基础属性',
      },
      {
        name: 'status',
        title: '状态',
        type: 'select',
        options: [
          { label: '正常', value: 'normal' },
          { label: '警告', value: 'warning' },
          { label: '危险', value: 'danger' },
          { label: '成功', value: 'success' },
        ],
        group: '基础属性',
      },
      {
        name: 'disabled',
        title: '禁用',
        type: 'boolean',
        defaultValue: false,
        group: '基础属性',
      },
      {
        name: 'long',
        title: '撑满父容器',
        type: 'boolean',
        defaultValue: false,
        group: '基础属性',
      },
    ],
    events: [
      { name: 'click', title: '点击', params: [
        { name: 'event', type: 'MouseEvent', description: '鼠标事件' },
      ] },
    ],
    slots: [
      { name: 'default', title: '默认插槽', description: '按钮内容' },
      { name: 'icon', title: '图标插槽', description: '按钮图标' },
    ],
    nestingRules: { isContainer: false },
    snippets: [
      { title: '主要按钮', props: { type: 'primary' }, children: [{ name: 'span', props: {} }] },
      { title: '危险按钮', props: { type: 'primary', status: 'danger' }, children: [{ name: 'span', props: {} }] },
    ],
  }
}
