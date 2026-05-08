# Query Grid

`useSunnyQueryGrid` 是 `vxe-grid` 的一个强大封装，提供了表头吸顶、简化的常用操作 API（如添加、删除）以及与 Vue 3 的无缝集成。

## 特性

-   **表头吸顶 (Sticky Header)**: 滚动页面时自动将表头固定在视口顶部。
-   **简化 API (Simplified API)**: 提供 `addEvent` 和 `deleteSelection` 等方法，简化数据操作。
-   **Vue 3 组合式 API (Composition API)**: 专为 `script setup` 设计。
-   **动态 Props & Slots**: 支持所有标准的 `vxe-grid` 属性和插槽。

## 用法

### 基础用法

<preview path="./demos/query-grid/BasicUsage.vue" title="基础用法" description="包含数据列表和事件处理" />

## 区域选取与快捷键

QueryGrid 内置了区域选取和常用键盘快捷键功能，默认启用。

### 行分组

QueryGrid 支持通过 `aggregateConfig` 配置行分组功能，表格会按指定字段自动进行行分组并显示分组行。

```typescript
const gridOptions = reactive({
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    { field: 'department', title: '部门', minWidth: 120 },
    { field: 'name', title: '姓名', minWidth: 100 },
    { field: 'salary', title: '薪资', minWidth: 100 },
  ],
  // 按部门字段进行行分组
  aggregateConfig: {
    groupFields: ['department']
  }
})

const [Grid, gridApi] = useSunnyQueryGrid({ gridOptions })
```

**aggregateConfig 参数说明**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `groupFields` | `string[]` | 按指定字段进行行分组 |

### 列筛选

QueryGrid 内置了多种列筛选渲染器，可以在列头点击筛选图标进行数据过滤。

#### FilterSimpleInput - 简单文本筛选

提供输入框和大小写敏感切换，通过子字符串包含匹配进行筛选。

```typescript
const tableColumns = [
  {
    field: 'cUsernumb',
    title: '用户编号',
    minWidth: 120,
    filters: [{ data: { isSensitive: false, sVal: '' } }],
    filterRender: { name: 'FilterSimpleInput' },
  },
]
```

#### FilterComplexInput - 高级文本筛选

在简单文本筛选基础上增加匹配类型选择（包含、等于、开头是、结尾是、大于、小于）。

```typescript
const tableColumns = [
  {
    field: 'salary',
    title: '薪资',
    minWidth: 100,
    filters: [{ data: { sType: 'include', isSensitive: false, sVal: '' } }],
    filterRender: { name: 'FilterComplexInput' },
  },
]
```

#### MyFilterComplex - 自定义筛选

基于 Vue 组件的筛选器，自动检测列是否配置 `params.optionlist` 来切换 select 模式和 input 模式。

```typescript
const tableColumns = [
  {
    field: 'status',
    title: '状态',
    minWidth: 120,
    params: { optionlist: statusOptions },
    filters: [{ data: '' }],
    filterRender: { name: 'MyFilterComplex' },
  },
]
```

#### 在 useList 中使用

`useList` 默认使用本地筛选（`filterConfig.remote: false`），列筛选直接在客户端过滤当前页数据：

```typescript
const { QueryForm, formApi, Grid, gridApi } = useList({
  searchFormSchema,
  tableColumns: [
    {
      field: 'cUsernumb',
      title: '用户编号',
      minWidth: 120,
      filters: [{ data: { isSensitive: false, sVal: '' } }],
      filterRender: { name: 'FilterSimpleInput' },
    },
    // ...其他列
  ],
  resourceConfig,
  queryFunction,
})
```

### 区域选取

- **鼠标区域选取**：拖拽鼠标可选取单元格区域
- **多区域选取**：按住鼠标可同时选取多个区域
- **列/行选取状态**：自动高亮显示选中的列和行
- **点击选取当前行**：点击单元格后自动选取当前行的单元格

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+A` | 全选 |
| `Ctrl+C` | 复制选中区域 |
| `Tab` | 切换到下一个单元格 |
| `方向键` | 在单元格之间移动 |
| `Shift+方向键` | 以活动区域为起始，向指定方向延伸选区 |

> QueryGrid 为只读查询表格，不支持剪切和粘贴操作。

### 操作提示

通过 `useList` 创建的列表页，工具栏右侧会自动显示 `!` 提示按钮，鼠标悬停可查看功能说明。

## API

### `useSunnyQueryGrid(options)`

#### 参数

-   `options`: 包含以下内容的对象：
    -   `gridOptions`: `vxe-grid` 的配置对象（列定义、数据等）。
    -   `gridEvents`: 事件名（如 `cellClick`）到处理函数的映射对象。

#### 返回值

返回一个元组 `[Grid, gridApi]`:

-   `Grid`: 需要在模板中渲染的 Vue 组件。
-   `gridApi`: 提供辅助方法的 `VxeGridApi` 实例。

### `VxeGridApi`

#### `addEvent(params?)`

向表格添加新行并激活该行的编辑模式。

-   `params` (可选):
    -   `record`: 新行的默认数据 (默认值: `{}`).
    -   `index`: 插入位置索引。使用 `-1` 表示插入到末尾 (默认值: `-1`).

```typescript
// 在末尾添加空行
gridApi.addEvent();

// 在开头添加带数据的行
gridApi.addEvent({ 
  record: { name: 'New User', age: 18 }, 
  index: 0 
});
```

#### `getSelection()`

获取表格中当前选中的（打钩的）所有行数据。

- **返回值**: 选中行的数据数组。如果没有选中任何行，返回空数组 `[]`。

```typescript
// 获取选中行数据
const selectedRows = gridApi.getSelection();

if (selectedRows.length > 0) {
  console.log('选中行:', selectedRows);
}
```

#### `deleteSelection()`

删除表格中当前选中的（打钩的）所有行。

```typescript
// 删除选中行
gridApi.deleteSelection();
```

#### `clearSelection()`

清除表格中所有行的选中状态。

```typescript
// 清除选中状态
gridApi.clearSelection();
```

#### `commitProxy(code, ...args)`

触发 VxeTable 的代理请求（如分页、排序等）。

```typescript
// 刷新表格数据
gridApi.commitProxy('query');
```

## 表头吸顶 (Sticky Header)

可以通过设置 `sticky` 属性来开启表头吸顶功能。它会监听滚动位置，当表格滚动出视野时，将表头固定在屏幕顶部。

<preview path="./demos/query-grid/StickyUsage.vue" title="表头吸顶" description="演示如何开启表头吸顶功能，请向下滚动页面查看效果" />

### 实现细节

-   使用 `IntersectionObserver` 逻辑（通过滚动事件监听器）来检测表头是否超出屏幕。
-   动态应用 `position: fixed` 并同步表头与表格的宽度。
-   插入占位元素以防止布局偏移。

## Props & Slots

`useSunnyQueryGrid` 返回的 `Grid` 组件会将所有属性 (`$attrs`) 和插槽 (`$slots`) 透传给底层的 `vxe-grid`。这意味着你可以使用所有标准的 `vxe-table` 功能。

```vue
<template>
  <Grid border show-overflow>
    <template #toolbar>
      <button @click="gridApi.addEvent()">添加</button>
    </template>
  </Grid>
</template>
```

## 完整示例

<preview path="./demos/query-grid/WholeUsage.vue" title="完整示例" description="展示完整的代码与预览，包含吸顶、分页、工具栏等完整功能" />
