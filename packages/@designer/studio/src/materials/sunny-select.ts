/**
 * SunnySelect 物料定义
 *
 * @ui 包的选择器组件，支持单选/多选/远程搜索等。
 * 设计态暴露常用 props。
 *
 * ## 属性面板字段
 *
 * | 属性 | 类型 | 默认值 | 说明 |
 * |------|------|--------|------|
 * | modelValue | string | - | 选中值 |
 * | placeholder | string | '请选择' | 占位文本 |
 * | disabled | boolean | false | 是否禁用 |
 * | allowClear | boolean | false | 允许清除 |
 * | multiple | boolean | false | 多选模式 |
 * | options | json | - | 下拉选项数据 |
 */
import { markRaw } from 'vue'
import type { ComponentMeta } from '@sunny-base-web/designer-materials'
import { SunnySelect } from '@sunny-base-web/ui'

/** 创建 SunnySelect 的 ComponentMeta */
export function createSunnySelectMeta(): ComponentMeta {
  return {
    name: 'SunnySelect',
    title: '选择器',
    component: markRaw(SunnySelect),
    category: 'entry',
    group: '表单组件',
    order: 2,
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
        defaultValue: '请选择',
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
        name: 'multiple',
        title: '多选',
        type: 'boolean',
        defaultValue: false,
        group: '基础属性',
      },
      {
        name: 'options',
        title: '选项列表',
        type: 'json',
        group: '高级属性',
        description: '下拉选项数据',
      },
    ],
    events: [
      { name: 'change', title: '变化', description: '选中值变化时触发', params: [
        { name: 'value', type: 'string | number | array', description: '当前选中值' },
      ] },
    ],
    slots: [],
    nestingRules: { isContainer: false },
    snippets: [
      { title: '基础选择器', props: { placeholder: '请选择' } },
    ],
  }
}
