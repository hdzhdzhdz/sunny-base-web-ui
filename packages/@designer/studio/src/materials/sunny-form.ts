/**
 * SunnyForm 物料定义
 *
 * @ui 包的表单组件，支持 schema 配置驱动。
 * 设计态暴露常用 props，schema 使用 json 类型编辑器。
 *
 * ## 属性面板字段
 *
 * | 属性 | 类型 | 默认值 | 说明 |
 * |------|------|--------|------|
 * | layout | select | 'horizontal' | 布局（horizontal/vertical/inline） |
 * | size | select | 'small' | 尺寸 |
 * | showDefaultActions | boolean | false | 显示操作按钮 |
 * | labelWidth | string | - | 标签宽度 |
 * | schema | json | - | 表单配置 |
 *
 * ## 容器行为
 *
 * `isContainer: true` — 表单可接受子节点拖入。
 */
import { markRaw } from 'vue'
import type { ComponentMeta } from '@sunny-base-web/designer-materials'
import { SunnyForm } from '@sunny-base-web/ui'

/** 创建 SunnyForm 的 ComponentMeta */
export function createSunnyFormMeta(): ComponentMeta {
  return {
    name: 'SunnyForm',
    title: '表单',
    component: markRaw(SunnyForm),
    category: 'entry',
    group: '表单组件',
    order: 1,
    props: [
      {
        name: 'layout',
        title: '布局',
        type: 'select',
        options: [
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' },
          { label: '行内', value: 'inline' },
        ],
        defaultValue: 'horizontal',
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
        defaultValue: 'small',
        group: '基础属性',
      },
      {
        name: 'showDefaultActions',
        title: '显示操作按钮',
        type: 'boolean',
        defaultValue: false,
        group: '基础属性',
      },
      {
        name: 'labelWidth',
        title: '标签宽度',
        type: 'string',
        group: '基础属性',
        description: '表单标签宽度，如 "100px"',
      },
      {
        name: 'schema',
        title: '表单配置',
        type: 'json',
        group: '高级属性',
        description: 'FormSchema[] JSON 配置',
      },
    ],
    events: [
      { name: 'handleSubmit', title: '提交', description: '表单提交时触发', params: [
        { name: 'values', type: 'Record<string, any>', description: '表单数据' },
      ] },
      { name: 'handleReset', title: '重置', description: '表单重置时触发', params: [
        { name: 'values', type: 'Record<string, any>', description: '重置后的表单数据' },
      ] },
    ],
    slots: [
      { name: 'default', title: '默认插槽', description: '表单内容' },
    ],
    nestingRules: { isContainer: true },
    snippets: [
      {
        title: '基础表单',
        description: '包含默认配置的空表单',
        props: { layout: 'vertical', showDefaultActions: true },
      },
    ],
  }
}
