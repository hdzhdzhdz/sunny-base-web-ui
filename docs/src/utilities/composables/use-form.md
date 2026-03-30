# useForm 钩子

`useForm` 是一个用于快速构建表单的组合式 API 钩子，它封装了 `useSunnyForm`，提供了默认的表单配置，简化了表单的开发流程。

## 功能特性

- 基于 `useSunnyForm` 封装
- 提供默认的表单布局和样式配置
- 支持自定义表单 schema
- 支持对象转值字段配置

## 类型定义

```typescript
interface UseFormOptions {
  /**
   * 表单配置 schema
   */
  schema?: any[]
  /**
   * 对象转值字段列表
   */
  objectToValueFields?: string[]
}

export function useForm({ schema = [], objectToValueFields }: UseFormOptions = {}) {
  return useSunnyForm({
    layout: 'horizontal',
    size: 'small',
    labelWidth: 100,
    gridProps: {
      xGap: 0,
      yGap: 0,
    },
    showDefaultActions: false,
    scrollToFirstError: true,
    schema,
    ...(objectToValueFields ? { objectToValueFields } : {})
  })
}
```

## 参数说明

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `schema` | `any[]` | 表单配置 schema，遵循 SunnyForm 的 schema 格式（可选） |
| `objectToValueFields` | `string[]` | 对象转值字段列表，用于将 BusinessSearch 等返回的对象数组转换为值字符串（可选） |

## 返回值

`useForm` 钩子返回 `useSunnyForm` 的所有返回值，包括：

| 返回值 | 类型 | 说明 |
| --- | --- | --- |
| `form` | `Component` | 表单组件 |
| `formApi` | `object` | 表单 API，用于操作表单 |
| `schemaRef` | `Ref<any[]>` | 表单 schema 的响应式引用 |
| `model` | `Ref<any>` | 表单数据模型 |
| `submitting` | `Ref<boolean>` | 提交状态 |
| `handleSubmit` | `(values: any) => Promise<void>` | 表单提交处理函数 |
| `resetFields` | `() => void` | 重置表单字段 |
| `validate` | `() => Promise<boolean>` | 表单验证函数 |

## 使用示例

### 基本用法

```vue
<script setup lang="ts">
import { useForm } from '@sunny-base-web/effects'

// 表单配置
const formSchema = [
  {
    fieldName: 'username',
    label: '用户名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入用户名',
      required: true
    }
  },
  {
    fieldName: 'email',
    label: '邮箱',
    component: 'Input',
    componentProps: {
      placeholder: '请输入邮箱',
      required: true
    }
  }
]

// 使用 useForm 钩子
const { form: Form, formApi } = useForm({
  schema: formSchema
})

// 处理表单提交
const handleSubmit = async () => {
  try {
    const values = await formApi.validate()
    console.log('表单数据:', values)
    // 提交表单数据
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<template>
  <div>
    <Form />
    <button @click="handleSubmit">提交</button>
  </div>
</template>
```

### 使用对象转值字段

```vue
<script setup lang="ts">
import { useForm } from '@sunny-base-web/effects'

// 表单配置
const formSchema = [
  {
    fieldName: 'user',
    label: '用户',
    component: 'BusinessSearch',
    componentProps: {
      placeholder: '请选择用户',
      required: true
    }
  }
]

// 使用 useForm 钩子，配置对象转值字段
const { form: Form, formApi } = useForm({
  schema: formSchema,
  objectToValueFields: ['user']
})
</script>

<template>
  <Form />
</template>
```

## 与 useSunnyForm 的关系

`useForm` 是对 `useSunnyForm` 的封装，提供了以下默认配置：

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `layout` | `'horizontal'` | 表单布局方式 |
| `size` | `'small'` | 表单组件尺寸 |
| `labelWidth` | `100` | 标签宽度 |
| `gridProps.xGap` | `0` | 网格水平间距 |
| `gridProps.yGap` | `0` | 网格垂直间距 |
| `showDefaultActions` | `false` | 是否显示默认操作按钮 |
| `scrollToFirstError` | `true` | 是否滚动到第一个错误字段 |

## 最佳实践

1. **模块化配置**：将表单 schema 配置分离到单独的文件中，提高代码可维护性
2. **类型定义**：为表单数据添加 TypeScript 类型，提高代码类型安全性
3. **错误处理**：在表单提交时添加适当的错误处理
4. **表单验证**：利用 `formApi.validate()` 进行表单验证
5. **响应式更新**：使用 `schemaRef` 动态更新表单配置

## 注意事项

- `useForm` 钩子依赖于 `@sunny-base-web/ui` 中的 `useSunnyForm`
- 确保表单 schema 配置符合 SunnyForm 的要求
- 对象转值字段功能需要配合 BusinessSearch 等组件使用