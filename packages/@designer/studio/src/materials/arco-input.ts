/**
 * Arco Design Input 物料定义
 *
 * 为 Arco Design Vue 的 Input 组件提供设计器所需的元数据。
 *
 * ## 属性面板字段
 *
 * | 属性 | 类型 | 默认值 | 说明 |
 * |------|------|--------|------|
 * | modelValue | string | - | 输入值 |
 * | placeholder | string | '请输入' | 占位文本 |
 * | disabled | boolean | false | 是否禁用 |
 * | allowClear | boolean | false | 允许清除 |
 * | maxLength | number | - | 最大长度 |
 * | size | select | 'medium' | 尺寸 |
 */
import { markRaw } from 'vue'
import type { ComponentMeta } from '@sunny-base-web/designer-materials'
import { Input } from '@arco-design/web-vue'

/** 创建 Arco Input 的 ComponentMeta */
export function createArcoInputMeta(): ComponentMeta {
  return {
    name: 'a-input',
    title: 'Arco 输入框',
    component: markRaw(Input),
    category: 'entry',
    group: 'Arco 组件',
    order: 11,
    props: [
      {
        name: 'modelValue',
        title: '值',
        type: 'string',
        group: '基础属性',
      },
      {
        name: 'placeholder',
        title: '占位文本',
        type: 'string',
        defaultValue: '请输入',
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
        name: 'allowClear',
        title: '允许清除',
        type: 'boolean',
        defaultValue: false,
        group: '基础属性',
      },
      {
        name: 'maxLength',
        title: '最大长度',
        type: 'number',
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
    ],
    events: [
      { name: 'input', title: '输入', params: [
        { name: 'value', type: 'string', description: '输入值' },
        { name: 'event', type: 'Event', description: '原生事件' },
      ] },
      { name: 'change', title: '变化', params: [
        { name: 'value', type: 'string', description: '当前值' },
      ] },
    ],
    slots: [
      { name: 'prepend', title: '前缀', description: '输入框前缀内容' },
      { name: 'append', title: '后缀', description: '输入框后缀内容' },
    ],
    nestingRules: { isContainer: false },
    snippets: [
      { title: '基础输入框', props: { placeholder: '请输入' } },
    ],
  }
}
