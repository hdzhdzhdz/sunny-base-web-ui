# Specification: SunnySearchInputTag (搜索输入标签)

## 1. Overview
`SunnySearchInputTag` 是一个专门用于展示多选结果并触发搜索操作的输入组件。
它基于 `a-input-tag` 封装，主要用于配合 `SunnySearchModal` 使用。
用户不能直接在输入框中输入文本，而是通过点击右侧的搜索图标唤起弹窗进行选择，选择的结果以 Tag 的形式展示在输入框中。
支持展示自定义字段（通过 `fieldNames` 配置），支持删除单个 Tag，支持一键清空。

## 2. User Stories
- **作为用户**，我希望能看到我已选择的数据项以标签(Tag)形式展示，直观清晰。
- **作为用户**，我希望能通过点击搜索图标，唤起更高级的选择器（如弹窗）。
- **作为用户**，我希望能直接在输入框中删除某个标签，或者一键清空所有标签。
- **作为开发者**，我希望能自定义标签显示的字段名（如显示 `name` 还是 `code`）。

## 3. Architecture & Design

### 3.1 Component Structure
- `packages/@ui/src/entry/search-input-tag/`
  - `SunnySearchInputTag.vue`: UI 实现，封装 `a-input-tag`。
  - `types.ts`: 类型定义。
  - `index.ts`: 导出。

### 3.2 UI Logic
- **Readonly Input**: 输入框本身禁止键盘输入（拦截 `keydown` 事件），仅保留删除键功能。
- **Suffix Icon**: 右侧固定显示搜索图标 (`icon-search`)，点击触发 `search` 事件。
- **Tag Rendering**: 将传入的 `modelValue` (对象数组) 转换为 `a-input-tag` 需要的格式 `{ label, value, closable }`。

### 3.3 API Design

#### Props
| Name | Type | Default | Description |
|Data | --- | --- | --- |
| `modelValue` | `any[]` | `[]` | 双向绑定的选中值数组 |
| `fieldNames` | `FieldNames` | `{ label: 'label', value: 'value' }` | 字段映射配置 |
| `placeholder` | `string` | `'请选择...'` | 占位文本 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `maxTagCount` | `number` | `-` | 最多显示的标签数量 |

#### Events
| Name | Parameters | Description |
|Data | --- | --- |
| `update:modelValue` | `(value: any[])` | 更新绑定值 |
| `search` | `-` | 点击搜索图标时触发 |
| `change` | `(value: any[])` | 值变化时触发 |
| `clear` | `-` | 点击清空按钮时触发 |

## 4. Usage Example

```vue
<template>
  <SunnySearchInputTag
    v-model="selectedItems"
    :field-names="{ label: 'name', value: 'id' }"
    placeholder="请选择用户"
    @search="handleOpenModal"
  />
</template>
```
