/**
 * Arco Design Input 物料定义
 */
import { markRaw } from 'vue'
import type { ComponentMeta } from '@sunny-base-web/designer-materials'
import { Input } from '@arco-design/web-vue'

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
