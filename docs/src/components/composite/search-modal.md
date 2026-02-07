# SunnySearchModal 公共查询弹窗

基于配置驱动的通用查询弹窗组件，支持搜索、分页表格、多选、已选列表展示等功能。

## 基础用法

通过 `sqlNum` 指定配置编号，组件会自动加载配置（搜索表单、表格列）。

<PreviewWrapper>
  <BasicUsage />
</PreviewWrapper>

## 静态配置用法

可以直接传入 `staticConfig` 对象，无需后端提供配置接口。适用于配置固定或前端动态生成的场景。

<PreviewWrapper>
  <StaticConfig />
</PreviewWrapper>

## API

### Props

| 参数名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| visible | 弹窗显示状态 (v-model) | `boolean` | `false` |
| width | 弹窗宽度 | `string \| number` | `'1200px'` |
| sqlNum | 配置编号 (核心参数) | `string` | - |
| conditions | 额外的查询条件 | `Record<string, any>` | - |
| modelValue | 默认选中的数据 (v-model) | `any[]` | `[]` |
| title | 弹窗标题 | `string` | - |
| multiple | 是否多选 | `boolean` | `true` |
| rowKey | 数据主键字段名 | `string` | `'id'` |
| fieldNames | 字段映射配置 | `{ label?: string, value?: string, desc?: string }` | `{ label: 'name', value: 'id', desc: 'code' }` |
| commonConfig | 表单通用配置 (传递给 SunnyForm) | `Record<string, any>` | `{ colProps: { xs: 24, ... } }` |
| staticConfig | 静态配置对象 (优先级高于 sqlNum) | `SearchConfig` | - |
| helpMessage | 帮助提示文本 (显示在标题栏) | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:visible | 弹窗显示状态变化 | `(visible: boolean) => void` |
| update:modelValue | 选中数据变化 | `(values: any[]) => void` |
| confirm | 点击确认按钮或双击行触发 | `(values: any[]) => void` |
| cancel | 点击取消按钮触发 | `() => void` |

<script setup>
import BasicUsage from './demos/search-modal/BasicUsage.vue';
import StaticConfig from './demos/search-modal/StaticConfig.vue';
</script>
