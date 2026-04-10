/**
 * Arco Design Textarea 物料定义
 */
import { markRaw } from 'vue'
import type { ComponentMeta } from '@sunny-base-web/designer-materials'
import { Textarea } from '@arco-design/web-vue'

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
