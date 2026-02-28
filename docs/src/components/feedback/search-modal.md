# SunnySearchModal 公共查询弹窗

基于配置驱动的通用查询弹窗组件，集成了搜索表单、分页表格、多选管理、已选列表展示等功能。

## 功能特性

- **配置驱动**：通过 JSON 配置即可生成搜索表单 (`formSchema`) 和表格列 (`tableColumns`)。
- **自动布局**：表单支持响应式布局，表格支持高度自适应和全屏模式。
- **状态管理**：内置分页逻辑、跨页多选状态保持、已选记录管理（侧边栏展示）。
- **交互优化**：支持双击行快速选择（单选模式）、右侧已选列表快速移除。

## 基础用法

通过 `formSchema` 配置搜索表单，`tableColumns` 配置表格列，`searchApi` 提供数据查询接口。

:::preview
demo-preview=./demos/search-modal/BasicUsage.vue
:::

## API

### Props

| 参数名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 默认选中的数据 (v-model) | `Record<string, any>[]` | `[]` |
| visible | 弹窗显示状态 (v-model:visible) | `boolean` | `false` |
| title | 弹窗标题 | `string` | `'数据查询'` |
| width | 弹窗宽度 | `string \| number` | `'800px'` |
| contentHeight | 内容区域高度 (表格区域) | `string \| number` | `300` |
| formSchema | 搜索表单配置 (SunnyForm) | `FormSchema[]` | **必传** |
| tableColumns | 表格列配置 (VxeGrid) | `VxeGridPropTypes.Columns` | **必传** |
| searchApi | 数据查询接口 | `(params: any) => Promise<any>` | **必传** |
| multiple | 是否多选 | `boolean` | `true` |
| rowKey | 数据主键字段名 | `string` | `'id'` |
| fieldNames | 字段映射配置 | `FieldNames` | `{ label: 'label', value: 'value', desc: 'desc' }` |
| commonConfig | 表单通用配置 (传递给 SunnyForm) | `Record<string, any>` | `{ colProps: { xs: 24, ... } }` |
| helpMessage | 帮助提示文本 (显示在标题栏) | `string` | `'支持跨页多选...'` |

### searchApi 说明

`searchApi` 接收一个参数对象，包含分页参数和表单字段：

```typescript
interface SearchParams {
  pageNo: number;   // 当前页码
  pageSize: number; // 每页条数
  [key: string]: any; // 表单字段
}
```

返回的 Promise 结果对象需包含列表和总数：

```typescript
interface SearchResult {
  list: any[];      // 或 records
  total: number;    // 或 totalCount
}
```

### FieldNames 配置

用于指定回显时显示的文本字段和值字段，特别是在右侧“已选列表”中展示时使用。

```typescript
{
  label: 'name',  // 主要显示的文本字段
  value: 'id',    // 值字段
  desc: 'code'    // 第二行辅助描述文本字段 (可选)
}
```

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:visible | 弹窗显示状态变化 | `(visible: boolean) => void` |
| update:modelValue | 选中数据变化 | `(values: any[]) => void` |
| confirm | 点击确认按钮或双击行触发 | `(values: any[]) => void` |
| cancel | 点击取消按钮或关闭弹窗触发 | `() => void` |
