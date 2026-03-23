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
