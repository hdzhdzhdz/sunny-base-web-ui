/**
 * Arco Design Textarea 物料定义
 *
 * 为 Arco Design Vue 的 Textarea 组件提供设计器所需的元数据。
 *
 * ## 属性面板字段
 *
 * | 属性 | 类型 | 默认值 | 说明 |
 * |------|------|--------|------|
 * | modelValue | string | - | 文本值 |
 * | placeholder | string | '请输入' | 占位文本 |
 * | disabled | boolean | false | 是否禁用 |
 * | autoSize | boolean | false | 自适应高度 |
 * | maxLength | number | - | 最大长度 |
 * | showWordLimit | boolean | false | 显示字数 |
 */
import { markRaw } from 'vue'
import type { ComponentMeta } from '@sunny-base-web/designer-materials'
import { Textarea } from '@arco-design/web-vue'

/** 创建 Arco Textarea 的 ComponentMeta */
export function createArcoTextareaMeta(): ComponentMeta {
  return {
    name: 'a-textarea',
    title: 'Arco 文本域',
    component: markRaw(Textarea),
    category: 'entry',
    group: 'Arco 组件',
    order: 12,
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
        name: 'autoSize',
        title: '自适应高度',
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
        name: 'showWordLimit',
        title: '显示字数',
        type: 'boolean',
        defaultValue: false,
        group: '基础属性',
      },
    ],
    events: [
      { name: 'input', title: '输入', params: [
        { name: 'value', type: 'string', description: '输入值' },
      ] },
      { name: 'change', title: '变化', params: [
        { name: 'value', type: 'string', description: '当前值' },
      ] },
    ],
    slots: [],
    nestingRules: { isContainer: false },
    snippets: [
      { title: '基础文本域', props: { placeholder: '请输入', autoSize: true } },
    ],
  }
}
