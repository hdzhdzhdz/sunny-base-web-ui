# useFormTabs

集成表单和标签页表格的自定义钩子，适用于包含多个表格的表单场景。

## 功能特点

- 集成表单和多个表格配置
- 支持标签页切换
- 支持声明式加载字典选项
- 支持权限控制
- 支持表格工具栏按钮配置

## 用法

```typescript
import { useFormTabs } from '@sunny-base-web/effects'

const [Form, formApi, gridComponents, gridApis] = useFormTabs({
  formSchema: addFormSchema,
  tabsConfig: tabsConfig
})
```

## 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| formSchema | `FormSchema[]` | 表单配置 |
| tabsConfig | `TabConfig[]` | 标签页配置 |
| objectToValueFields | `string[]` | 对象转值字段 |

## TabConfig 类型

```typescript
interface TabConfig {
  title: string
  type: 'grid' | 'form'
  gridConfig?: {
    columns: VxeGridProps['columns']
    editRules: any
    toolbarButtons?: Array<{ code: string; name: string }>
  }
}
```

## 返回值

| 返回值 | 类型 | 描述 |
|------|------|------|
| Form | `Component` | 表单组件 |
| formApi | `FormApi` | 表单API |
| gridComponents | `Component[]` | 表格组件数组 |
| gridApis | `GridApi[]` | 表格API数组 |

## 示例

```vue
<script setup lang="ts">
import { useFormTabs } from '@sunny-base-web/effects'
import { addFormSchema, tabsConfig } from './config'

const [Form, formApi, gridComponents, gridApis] = useFormTabs({
  formSchema: addFormSchema,
  tabsConfig: tabsConfig
})

const activeTab = ref(0)
</script>

<template>
  <Form />
  
  <Tabs v-model="activeTab">
    <TabPane v-for="(tab, index) in tabsConfig" :key="index" :title="tab.title">
      <component :is="gridComponents[index]" 
                :id="`grid-${index}`" 
                border 
                max-height="300" />
    </TabPane>
  </Tabs>
</template>
```
