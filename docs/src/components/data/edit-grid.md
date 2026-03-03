# EditGrid 编辑表格

`useSunnyEditGrid` 是基于 `vxe-grid` 封装的编辑表格组件，提供了便捷的行编辑功能、简化的常用操作 API 以及与 Vue 3 的无缝集成。

## 特性

- **行编辑支持**: 支持表格行的直接编辑操作
- **简化 API (Simplified API)**: 提供 `addEvent`、`deleteSelection` 和 `commitProxy` 等方法，简化数据操作
- **Vue 3 组合式 API (Composition API)**: 专为 `script setup` 设计
- **动态 Props & Slots**: 支持所有标准的 `vxe-grid` 属性和插槽
- **代理模式**: 支持通过 `commitProxy` 提交数据变更

## 用法

### 基础用法

<preview path="./demos/edit-grid/BasicUsage.vue" title="基础用法" description="演示编辑表格的基本功能，包括添加、删除、编辑行" />

## API

### `useSunnyEditGrid(options)`

#### 参数

- `options`: 包含以下内容的对象：
  - `gridOptions`: `vxe-grid` 的配置对象（列定义、数据等）
  - `gridEvents`: 事件名（如 `cellClick`）到处理函数的映射对象

#### 返回值

返回一个元组 `[Grid, gridApi]`:

- `Grid`: 需要在模板中渲染的 Vue 组件
- `gridApi`: 提供辅助方法的 `VxeGridApi` 实例

### `VxeGridApi`

#### `addEvent(params?)`

向表格添加新行并激活该行的编辑模式。

- `params` (可选):
  - `record`: 新行的默认数据 (默认值: `{}`)
  - `index`: 插入位置索引。使用 `-1` 表示插入到末尾 (默认值: `-1`)

```typescript
// 在末尾添加空行
gridApi.addEvent();

// 在开头添加带数据的行
gridApi.addEvent({ 
  record: { name: 'New User', age: 18 }, 
  index: 0 
});
```

#### `deleteSelection()`

删除表格中当前选中的（打钩的）所有行。

```typescript
// 删除选中行
gridApi.deleteSelection();
```

#### `commitProxy(code)`

提交代理操作，用于处理数据提交等业务逻辑。

- `code`: 代理代码标识符

```typescript
// 提交数据变更
await gridApi.commitProxy('save');
```

## 编辑配置

在 `gridOptions` 中配置列的编辑属性：

```typescript
const gridOptions = {
  columns: [
    { field: 'name', title: '姓名', editRender: { name: 'AInput' } },
    { field: 'age', title: '年龄', editRender: { name: 'AInputNumber' } },
    { field: 'role', title: '角色', editRender: { name: 'ASelect', options: [...] } }
  ]
}
```

## Props & Slots

`useSunnyEditGrid` 返回的 `Grid` 组件会将所有属性 (`$attrs`) 和插槽 (`$slots`) 透传给底层的 `vxe-grid`。这意味着你可以使用所有标准的 `vxe-table` 功能。

```vue
<template>
  <Grid border :data="tableData" :columns="columns">
    <template #toolbar>
      <a-button @click="gridApi.addEvent()">添加</a-button>
      <a-button @click="gridApi.deleteSelection()">删除</a-button>
      <a-button type="primary" @click="gridApi.commitProxy('save')">保存</a-button>
    </template>
  </Grid>
</template>
```

## 编辑器类型

EditGrid 支持使用 Arco Design 的表单组件作为编辑器：

- `AInput`: 文本输入
- `AInputNumber`: 数字输入
- `ASelect`: 下拉选择
- `ADatePicker`: 日期选择
- `ASwitch`: 开关
- 以及其他 Arco Design 表单组件
