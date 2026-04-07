# useFormTable

集成表单和表格的自定义钩子，适用于包含单个表格的表单场景。

## 功能特点

- 集成表单和表格配置
- 支持声明式加载字典选项
- 支持权限控制
- 支持表格工具栏按钮配置

## 用法

```typescript
import { useFormTable } from '@sunny-base-web/effects'

const [Form, formApi, Grid, gridApi] = useFormTable({
  formSchema: addFormSchema,
  tableColumns: gridColumns,
  tableEditRules: gridEditRules,
  tableToolbarButtons: tableToolbarButtons
})
```

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| formSchema | `FormSchema[]` | 表单配置 |
| tableColumns | `VxeGridProps['columns']` | 表格列配置 |
| tableEditRules | `any` | 表格编辑规则 |
| tableToolbarButtons | `Array<{ code: string; name: string }>` | 表格工具栏按钮配置 |
| objectToValueFields | `string[]` | 对象转值字段 |

## 返回值

| 返回值 | 类型 | 描述 |
|------|------|------|
| Form | `Component` | 表单组件 |
| formApi | `FormApi` | 表单API |
| Grid | `Component` | 表格组件 |
| gridApi | `GridApi` | 表格API |

## 示例

```vue
<script setup lang="ts">
import { useFormTable } from '@sunny-base-web/effects'
import { addFormSchema, gridColumns, gridEditRules, tableToolbarButtons } from './config'

const [Form, formApi, Grid, gridApi] = useFormTable({
  formSchema: addFormSchema,
  tableColumns: gridColumns,
  tableEditRules: gridEditRules,
  tableToolbarButtons: tableToolbarButtons
})
</script>

<template>
  <Form />
  <Grid border max-height="300" />
</template>
```
