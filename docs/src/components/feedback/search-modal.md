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

## 设置默认值

在 `formSchema` 中通过 `defaultValue` 设置表单字段默认值。弹窗打开时，会先设置默认值再触发查询。

:::preview
demo-preview=./demos/search-modal/DefaultValue.vue
:::

## 表单校验

组件内置了表单校验机制，在以下场景会自动进行表单校验：

### 校验触发时机

| 场景 | 校验行为 |
| --- | --- |
| 弹窗打开时 | 先设置默认值 → 校验表单 → 校验通过才执行查询 |
| 点击查询按钮 | **重置分页为第一页** → 校验表单 → 校验通过才执行查询 |
| 点击重置按钮 | 重置表单 → **重置分页为第一页** → 校验表单 → 校验通过才执行查询 |

::: tip 分页重置说明
点击「查询」或「重置」按钮时，分页会自动重置为第一页，避免因翻页导致查询不到数据的问题。
:::

### 校验规则配置

通过 `formSchema` 中的 `rules` 字段配置校验规则：

```typescript
const formSchema = [
  {
    fieldName: 'keyword',
    label: '关键字',
    component: 'Input',
    rules: 'required', // 必填校验
    componentProps: { placeholder: '请输入关键字' }
  },
  {
    fieldName: 'type',
    label: '类型',
    component: 'Select',
    rules: 'selectRequired', // 下拉框必填校验
    componentProps: {
      options: [
        { label: '类型A', value: 'A' },
        { label: '类型B', value: 'B' }
      ]
    }
  }
];
```

### 校验规则类型

| 规则名 | 说明 |
| --- | --- |
| `required` | 必填校验（适用于 Input） |
| `selectRequired` | 下拉框必填校验 |
| Zod Schema | 支持使用 Zod 进行复杂校验 |

### 校验流程说明

```
用户操作 → 触发表单校验 → 校验结果
                          ├── 通过 → 执行查询（loading = true）
                          └── 失败 → 显示错误信息，不执行查询
```

**重要提示**：校验失败时不会触发 `loading` 状态，用户可以继续修改表单后重新提交。

## 自定义表单字段 Slot

当内置的表单组件无法满足需求时，可以使用 Slot 自定义表单字段渲染。只需在 `formSchema` 中将 `component` 设置为 `'Slot'`，然后通过同名 slot 自定义渲染。

:::preview
demo-preview=./demos/search-modal/CustomSlot.vue
:::

### Slot 使用说明

1. 在 `formSchema` 中设置 `component: 'Slot'`
2. 使用 `#fieldName` 作为 slot 名称
3. Slot Props 提供字段值和更新方法

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

### Slots

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| `[fieldName]` | 自定义表单字段 (需在 formSchema 中设置 `component: 'Slot'`) | SlotProps |
| submit-before | 查询按钮前插槽 | - |
| reset-before | 重置按钮前插槽 | - |

### SlotProps

自定义表单字段 Slot 接收的参数：

```typescript
interface SlotProps {
  value: any;              // 当前字段值
  setValue: (val: any) => void;  // 更新字段值的方法
  model: Record<string, any>;    // 整个表单的值对象
  disabled: boolean;       // 是否禁用
  errorMessage?: string;   // 验证错误信息
  componentProps: Record<string, any>;  // 组件属性
}
```

**使用示例：**

```vue
<template>
  <SunnySearchModal :form-schema="formSchema" ...>
    <!-- 自定义字段 Slot -->
    <template #customField="{ value, setValue, disabled }">
      <a-input-number
        :value="value"
        :disabled="disabled"
        @change="setValue"
      />
    </template>
  </SunnySearchModal>
</template>

<script setup>
const formSchema = [
  {
    fieldName: 'customField',
    label: '自定义字段',
    component: 'Slot',  // 必须设置为 'Slot'
  }
];
</script>
```
