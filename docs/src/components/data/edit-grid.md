---
outline: [2, 4]
---

# EditGrid 编辑表格

`useSunnyEditGrid` 是基于 `vxe-grid` 封装的编辑表格组件，提供了便捷的行编辑功能、简化的常用操作 API 以及与 Vue 3 的无缝集成。


## 用法

### 基础用法

<preview path="./demos/edit-grid/SimpleUsage.vue" title="基础用法" description="最简单的 EditGrid 使用方式，包含基础配置和列定义" />

### 完整用法
<preview path="./demos/edit-grid/BasicUsage.vue" title="完整用法" description="演示编辑表格的完整功能，包括所有编辑器类型、校验、事件处理等" />

### 加载资源用法
<preview path="./demos/edit-grid/ResourceUsage.vue" title="加载资源用法" description="演示编辑表格的加载资源功能，包括数据加载、列定义等" />

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

### `VxeGridApi 方法`

#### `reloadData`

加载数据并清除所有状态。

- `data`: 要加载的数据数组

```typescript
// 重新加载数据
await gridApi.reloadData(newData);
```

#### `getFullData`

获取完整的全量表体数据。

```typescript
// 获取全量数据
const data = await gridApi.getFullData();
```

#### `getCheckboxRecords`

获取选中的行数据。

```typescript
// 获取选中行
const selectedRows = await gridApi.getCheckboxRecords();
```

#### `addEvent`

向表格添加新行并激活该行的编辑模式。

- `record`: 新行的默认数据 (可选)
- `index`: 插入位置索引，`null` 从第一行插入，`-1` 从最后插入 (可选)

```typescript
// 在末尾添加空行
gridApi.addEvent();

// 在开头添加带数据的行
gridApi.addEvent({ name: 'New User', age: 18 }, 0);
```

#### `deleteSelection`

删除表格中当前选中的（打钩的）所有行。

```typescript
// 删除选中行
gridApi.deleteSelection();
```

#### `validate`

校验表格数据。

- `full`: 是否校验全量数据，默认 `true`

```typescript
// 校验表格数据
const errMap = await gridApi.validate();
if (errMap) {
  console.log('校验失败', errMap);
} else {
  console.log('校验成功');
}
```

#### `$grid`

获取 VxeGrid 实例，可以直接调用 VxeTable 的所有方法。

```typescript
// 获取 VxeGrid 实例
const grid = gridApi.$grid;

// 调用 VxeGrid 方法
gridApi.$grid.clearAll();
gridApi.$grid.setCurrentRow(row);
gridApi.$grid.scrollTo(100, 200);
gridApi.$grid.clearFilter();
gridApi.$grid.clearSort();
gridApi.$grid.setAllCheckboxRow(true);
gridApi.$grid.getScrollY();
```
> 💡 查看完整的 VxeGrid 方法列表，请参考 [官方文档](https://vxetable.cn/v4/#/grid/api)。

### Events 事件

`gridEvents` 用于监听 `vxe-grid` 的各种事件。事件处理函数会接收到与 VxeTable 官方文档相同的参数。

```typescript
const gridEvents = {
  // 单元格点击事件
  cellClick: ({ row, column, $rowIndex, $columnIndex }: any) => {
    console.log('单元格点击:', row);
  },

  // 单元格双击事件
  cellDblclick: ({ row }: any) => {
    console.log('单元格双击:', row);
  },

  // 复选框变化事件
  checkboxChange: ({ checked, row, $rowIndex }: any) => {
    console.log('复选框变化:', checked, row);
  },

  // 数据变化事件
  dataChange: ({ row, column }: any) => {
    console.log('数据变化:', row, column);
  },

  // 编辑激活事件
  editActived: ({ row, column }: any) => {
    console.log('编辑激活:', row, column);
  },

  // 编辑关闭事件
  editClosed: ({ row, column }: any) => {
    console.log('编辑关闭:', row, column);
  },
};

const [Grid, gridApi] = useSunnyEditGrid({ gridOptions, gridEvents });
```

> 💡 查看完整的 VxeGrid 事件列表，请参考 [VxeTable 官方文档](https://vxetable.cn/v4/#/grid/api)。

## Props & Slots

`useSunnyEditGrid` 返回的 `Grid` 组件会将所有属性 (`$attrs`) 和插槽 (`$slots`) 透传给底层的 `vxe-grid`。这意味着你可以使用所有标准的 `vxe-table` 功能。

> 💡 查看 [VxeTable 官方文档](https://vxetable.cn/v4/#/grid/api) 了解完整的 API 和配置选项。

### Slots 示例
#### 工具栏插槽

使用 `#toolbar` 插槽自定义工具栏内容：

```vue
<template>
  <Grid border :columns="columns">
    <template #toolbar>
      <a-button type="primary" @click="gridApi.addEvent()">添加</a-button>
      <a-button @click="gridApi.deleteSelection()">删除</a-button>
      <a-button @click="handleSave">保存</a-button>
    </template>
  </Grid>
</template>
```

#### 列插槽

在 columns 配置中使用 `slots` 自定义列的渲染内容：

```typescript
const columns = [
  {
    field: 'name',
    title: '姓名',
    slots: {
      default: ({ row }: { row: any }) => {
        return h('span', { style: { color: 'red' } }, row.name)
      }
    }
  },
  {
    field: 'status',
    title: '状态',
    slots: {
      default: ({ row }: { row: any }) => {
        return row.status === 'active'
          ? h('a-tag', { color: 'green' }, '激活')
          : h('a-tag', { color: 'red' }, '禁用')
      }
    }
  }
]
```

或在模板中使用 `#column_{field}` 插槽：

```vue
<template>
  <Grid border :columns="columns">
    <template #column_status="{ row }">
      <a-tag :color="row.status === 'active' ? 'green' : 'red'">
        {{ row.status === 'active' ? '激活' : '禁用' }}
      </a-tag>
    </template>
  </Grid>
</template>
```

## 表单校验

EditGrid 支持 VxeTable 的校验规则，通过 `editRules` 配置实现表单字段的校验。

### 基础校验

```typescript
const gridOptions = {
  editRules: {
    name: [
      { required: true, message: '请输入姓名' }
    ],
    age: [
      { required: true, message: '请输入年龄' }
    ]
  }
}
```

### 多字段关联校验

对于区间类型字段（如 `InputRangeRender`、`RangePickerRender`），当使用 `fieldNames` 将范围值分别存储到不同字段时，需要对每个字段单独配置校验规则。

使用 `Validators.requiredValidator` 进行多字段关联校验：

```typescript
import { useSunnyEditGrid, EditRender, Validators } from '@sunny-base-web/ui';

const gridOptions = {
  columns: [
    {
      field: 'priceRange',
      title: '价格范围',
      width: 250,
      ...EditRender.InputRangeRender,
      params: {
        inputType: 'number',
        fieldNames: { start: 'minPrice', end: 'maxPrice' }
      }
    },
    {
      field: 'dateRange',
      title: '日期范围',
      width: 280,
      ...EditRender.RangePickerRender,
      params: {
        fieldNames: { start: 'startDate', end: 'endDate' }
      }
    }
  ],
  editRules: {
    priceRange: [
      { required: true, field: 'minPrice', message: '请输入最小价格', validator: Validators.requiredValidator },
      { required: true, field: 'maxPrice', message: '请输入最大价格', validator: Validators.requiredValidator },
    ],
    dateRange: [
      { required: true, field: 'startDate', message: '请选择开始日期', validator: Validators.requiredValidator },
      { required: true, field: 'endDate', message: '请选择结束日期', validator: Validators.requiredValidator },
    ]
  }
}
```

**requiredValidator 参数说明**：
- `field`: 指定要校验的字段名（从 `row` 对象中读取）
- `required`: 是否必填
- `message`: 校验失败时的提示信息
- `validator`: 必须设置为 `Validators.requiredValidator`

**校验逻辑**：
- 当值为 `null`、`undefined` 或空字符串 `''` 时，校验失败
- 数字 `0`、`0.0` 等被视为有效值，不会触发校验失败

### 执行校验

使用 `gridApi.validate()` 方法执行表格校验：

```typescript
const fullValidEvent = async () => {
  const errMap = await gridApi.validate()
  if (errMap) {
    console.log('校验失败', errMap);
  } else {
    console.log('校验成功');
  }
}
```

> 💡 查看 [VxeTable 官方文档](https://vxetable.cn/v4/#/grid/start/edit) 了解更多校验规则和配置选项。

## 行拖拽排序

EditGrid 支持通过拖拽行来调整行的顺序，适用于需要手动排序的场景。

### 基础配置

行拖拽排序需要同时配置两个属性：

1. **列配置中的 `dragSort`**：在序号列或任意列中启用拖拽排序
2. **行配置中的 `drag`**：启用行拖拽功能

```typescript
const gridOptions = {
  columns: [
    { type: 'checkbox', width: 40, align: 'center', fixed: 'left' },
    {
      type: 'seq',
      title: '序号',
      width: 50,
      align: 'center',
      fixed: 'left',
      dragSort: true // 开启列拖拽排序功能，用于行拖拽排序
    },
    // ... 其他列
  ],
  rowConfig: {
    keyField: 'id',
    drag: true, // 开启行拖拽功能，配合 dragSort 实现行拖拽排序
  },
  // ... 其他配置
}
```

### 配置说明

| 配置项 | 位置 | 说明 |
|--------|------|------|
| `dragSort: true` | 列配置（columns） | 启用列的拖拽排序功能，通常配置在序号列上 |
| `drag: true` | 行配置（rowConfig） | 启用行拖拽功能 |

### 使用示例

```vue
<script setup lang="ts">
import { reactive } from 'vue';
import { useSunnyEditGrid } from '@sunny-base-web/ui';

const gridOptions = reactive({
  columns: [
    { type: 'checkbox', width: 40, align: 'center', fixed: 'left' },
    {
      type: 'seq',
      title: '序号',
      width: 50,
      align: 'center',
      fixed: 'left',
      dragSort: true // 开启列拖拽排序
    },
    { field: 'name', title: '姓名', width: 150 },
    { field: 'age', title: '年龄', width: 100 },
    { field: 'email', title: '邮箱', width: 200 }
  ],
  rowConfig: {
    keyField: 'id',
    drag: true // 开启行拖拽
  },
  editConfig: {
    enabled: true,
    trigger: 'click',
    mode: 'row'
  }
});

const [Grid, gridApi] = useSunnyEditGrid({ gridOptions });
</script>

<template>
  <Grid border />
</template>
```

### 注意事项

1. **序号列推荐**：建议在序号列（`type: 'seq'`）上配置 `dragSort: true`，这样用户可以通过拖拽序号来调整行顺序，操作更直观
2. **keyField 配置**：使用行拖拽时，需要在 `rowConfig` 中配置 `keyField` 指定行的唯一标识字段
3. **编辑模式兼容**：行拖拽排序功能与编辑模式可以同时使用，拖拽操作不会影响编辑功能
4. **数据顺序**：拖拽排序后会自动更新表格数据的顺序，可以通过 `gridApi.getFullData()` 获取排序后的数据

## 编辑器类型

EditGrid 支持使用 Arco Design 的表单组件作为编辑器：

> 💡 **params 参数说明**：
> - 所有编辑器的 `params` 数据默认会透传给对应的 Arco Design 组件
> - 可以直接使用对应组件的所有 props（如 `placeholder`、`allowClear` 等）
> - 部分编辑器提供了特殊参数（如 `fieldNames`、`inputType`），用于扩展组件功能


### SpanRender
文本-选项筛选，纯文本显示类型。

**适用场景**：
- 只读列，需要显示原始值
- 不需要值到文本的转换
- 配合表格筛选功能使用（如 VxeTable 的 filter）

```typescript
const gridOptions = {
  columns: [
    {
      field: 'code',
      title: '编码',
      ...EditRender.SpanRender
    },
    {
      field: 'category',
      title: '分类',
      ...EditRender.SpanRender
    }
  ]
}
```

**特点**：
- 纯文本显示，不进行任何转换
- 支持配合 VxeTable 的筛选功能
- 适合显示编码、ID 等不需要转换的值

**参数说明**：
- 无特殊参数，直接显示字段原始值

**与 SpanRender 的区别**：
| 特性 | SpanRender | SpanselectRender |
|------|-----------|------------------|
| 显示方式 | 支持从 options 映射显示 label | 直接显示原始值 |
| 适用场景 | 需要值转换的场景（如状态码转文本） | 不需要转换的场景（如编码、ID） |
| 配置复杂度 | 需要配置 options 参数 | 无需配置 |

### SpanselectRender

纯文本显示，支持从 options 中查找对应的 label 显示值。

**适用场景**：
- 只读列，需要显示文本但不需要编辑
- 需要将值转换为对应的标签显示（如将状态码转换为状态文本）
- 配合 `options` 参数实现值到文本的映射

```typescript
const statusOptions = [
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' }
]

const gridOptions = {
  columns: [
    {
      field: 'status',
      title: '状态',
      width: 120,
      ...EditRender.SpanselectRender,
      params: {
        options: statusOptions
      }
    }
  ]
}
```

**示例说明**：
- 当 `row.status` 的值为 `'1'` 时，显示 `'启用'`
- 当 `row.status` 的值为 `'0'` 时，显示 `'禁用'`
- 如果在 options 中找不到对应的值，则直接显示原始值

**参数说明**：
- `options`: 可选参数，用于值到文本的映射配置
  - `label`: 选项显示的文本
  - `value`: 选项对应的值
- 不配置 `options` 时，直接显示字段原始值

### InputRender

文本输入框。

```typescript
const gridOptions = {
  columns: [
    {
      field: 'name',
      title: '姓名',
      width: 150,
      ...EditRender.InputRender,
      params: {
        placeholder: '请输入姓名',
        allowClear: true,
        maxLength: 50
      }
    }
  ]
}
```

支持的 params：
- `placeholder`: 占位符文本
- `allowClear`: 是否显示清除按钮
- `maxLength`: 最大输入长度
- 其他 Input 组件的属性

### InputNumberRender

数字输入框。

```typescript
const gridOptions = {
  columns: [
    {
      field: 'age',
      title: '年龄',
      width: 120,
      ...EditRender.InputNumberRender,
      params: {
        placeholder: '请输入年龄',
        min: 0,
        max: 120,
        precision: 0
      }
    }
  ]
}
```

支持的 params：
- `placeholder`: 占位符文本
- `min`: 最小值
- `max`: 最大值
- `precision`: 精度（小数位数）
- 其他 InputNumber 组件的属性

### SelectRender

下拉选择框。

```typescript
const roleOptions = [
  { label: '管理员', value: '0' },
  { label: '用户', value: '1' }
]

const gridOptions = {
  columns: [
    {
      field: 'role',
      title: '角色',
      width: 150,
      ...EditRender.SelectRender,
      params: {
        options: roleOptions,
        placeholder: '请选择角色',
        allowClear: true
      }
    }
  ]
}
```

支持的 params：
- `placeholder`: 占位符文本
- `allowClear`: 是否显示清除按钮
- 其他 Select 组件的属性

#### options 选项配置

`options` 用于配置下拉选项，格式为数组：

```typescript
const roleOptions = [
  { label: '管理员', value: '0' },
  { label: '用户', value: '1' },
  { label: '访客', value: '2' }
]

const gridOptions = {
  columns: [
    {
      field: 'role',
      ...EditRender.SelectRender,
      params: {
        options: roleOptions
      }
    }
  ]
}
```

**options 参数说明**：
- `label`: 选项显示的文本
- `value`: 选项对应的值

### DatePickerRender

日期选择器。

```typescript
const gridOptions = {
  columns: [
    {
      field: 'createTime',
      title: '创建时间',
      width: 180,
      ...EditRender.DatePickerRender,
      params: {
        placeholder: '请选择日期',
        format: 'YYYY-MM-DD',
        allowClear: true
      }
    }
  ]
}
```

支持的 params：
- `placeholder`: 占位符文本
- `format`: 日期格式
- `allowClear`: 是否显示清除按钮
- 其他 DatePicker 组件的属性

### MonthPickerRender

月份选择器。

```typescript
const gridOptions = {
  columns: [
    {
      field: 'month',
      title: '月份',
      width: 150,
      ...EditRender.MonthPickerRender,
      params: {
        placeholder: '请选择月份',
        format: 'YYYY-MM'
      }
    }
  ]
}
```

支持的 params：
- `placeholder`: 占位符文本
- `format`: 日期格式
- 其他 MonthPicker 组件的属性

### YearPickerRender

年份选择器。

```typescript
const gridOptions = {
  columns: [
    {
      field: 'year',
      title: '年份',
      width: 120,
      ...EditRender.YearPickerRender,
      params: {
        placeholder: '请选择年份'
      }
    }
  ]
}
```

支持的 params：
- `placeholder`: 占位符文本
- 其他 YearPicker 组件的属性

### WeekPickerRender

周选择器。

```typescript
const gridOptions = {
  columns: [
    {
      field: 'week',
      title: '周',
      width: 150,
      ...EditRender.WeekPickerRender,
      params: {
        placeholder: '请选择周',
        format: 'YYYY-wo'
      }
    }
  ]
}
```

支持的 params：
- `placeholder`: 占位符文本
- `format`: 日期格式
- 其他 WeekPicker 组件的属性

### RangePickerRender

日期范围选择器。

```typescript
const gridOptions = {
  columns: [
    {
      field: 'dateRange',
      title: '日期范围',
      width: 280,
      ...EditRender.RangePickerRender,
      params: {
        placeholder: ['开始日期', '结束日期'],
        format: 'YYYY-MM-DD'
      }
    }
  ]
}
```

#### fieldNames 配置

`fieldNames` 用于将范围值分别存储到不同的字段：

```typescript
const gridOptions = {
  columns: [
    {
      field: 'dateRange',
      title: '日期范围',
      width: 280,
      ...EditRender.RangePickerRender,
      params: {
        fieldNames: { start: 'startDate', end: 'endDate' },
        placeholder: ['开始日期', '结束日期'],
        format: 'YYYY-MM-DD'
      }
    }
  ]
}
```

**fieldNames 参数说明**：
- `start`: 范围起始值对应的字段名（如 `'startDate'`）
- `end`: 范围结束值对应的字段名（如 `'endDate'`）
- 使用 `fieldNames` 后，数据结构从 `{ dateRange: ['2024-01-01', '2024-01-31'] }` 变为 `{ startDate: '2024-01-01', endDate: '2024-01-31' }`
- 这种方式适合需要独立处理开始和结束值的场景，例如查询接口需要分开传参

**不使用 fieldNames** 时，数据结构为：
```typescript
{
  dateRange: ['2024-01-01', '2024-01-31']
}
```

**使用 fieldNames** 映射到不同的字段：

```typescript
const gridOptions = {
  columns: [
    {
      field: 'dateRange',
      title: '日期范围',
      width: 280,
      ...EditRender.RangePickerRender,
      params: {
        fieldNames: { start: 'startDate', end: 'endDate' },
        placeholder: ['开始日期', '结束日期']
      }
    }
  ]
}
```

使用 `fieldNames` 后，数据结构变为：
```typescript
{
  startDate: '2024-01-01',
  endDate: '2024-01-31'
}
```

### InputRangeRender

区间输入框，支持 input 和 number 类型。

```typescript
const gridOptions = {
  columns: [
    {
      field: 'priceRange',
      title: '价格范围',
      width: 250,
      ...EditRender.InputRangeRender,
      params: {
        inputType: 'number',
        fieldNames: { start: 'minPrice', end: 'maxPrice' },
        placeholder: ['最小价格', '最大价格']
      }
    }
  ]
}
```

#### fieldNames 配置

`fieldNames` 用于将区间值分别存储到不同的字段：

```typescript
const gridOptions = {
  columns: [
    {
      field: 'priceRange',
      title: '价格范围',
      width: 250,
      ...EditRender.InputRangeRender,
      params: {
        inputType: 'number',
        fieldNames: { start: 'minPrice', end: 'maxPrice' },
        placeholder: ['最小价格', '最大价格']
      }
    }
  ]
}
```

**fieldNames 参数说明**：
- `start`: 区间起始值对应的字段名（如 `'minPrice'`）
- `end`: 区间结束值对应的字段名（如 `'maxPrice'`）
- 使用 `fieldNames` 后，数据结构从 `{ priceRange: ['10', '100'] }` 变为 `{ minPrice: '10', maxPrice: '100' }`
- 这种方式适合需要独立处理最小值和最大值的场景，例如查询接口需要分开传参、或者需要单独校验每个字段

**不使用 fieldNames** 时，数据结构为：
```typescript
{
  priceRange: ['10', '100']
}
```

**使用 fieldNames** 映射到不同的字段：

```typescript
const gridOptions = {
  columns: [
    {
      field: 'priceRange',
      title: '价格范围',
      width: 250,
      ...EditRender.InputRangeRender,
      params: {
        inputType: 'number',
        fieldNames: { start: 'minPrice', end: 'maxPrice' },
        placeholder: ['最小价格', '最大价格']
      }
    }
  ]
}
```

使用 `fieldNames` 后，数据结构变为：
```typescript
{
  minPrice: '10',
  maxPrice: '100'
}
```

#### inputType 配置

`inputType` 用于指定区间输入框的类型，支持 `input` 或 `number`：

```typescript
// 使用 number 类型
const gridOptions = {
  columns: [
    {
      field: 'priceRange',
      title: '价格范围',
      width: 250,
      ...EditRender.InputRangeRender,
      params: {
        inputType: 'number',
        fieldNames: { start: 'minPrice', end: 'maxPrice' }
      }
    }
  ]
}
```

**inputType 参数说明**：
- `input`: 文本输入框（默认）
- `number`: 数字输入框，支持数字输入和步进器
- 使用 `number` 类型时，可以配合 `min`、`max`、`precision` 等参数控制输入范围和精度

### SwitchRender

开关。

```typescript
const gridOptions = {
  columns: [
    {
      field: 'enabled',
      title: '状态',
      width: 120,
      ...EditRender.SwitchRender,
      params: {
        checkedValue: '1',
        uncheckedValue: '0',
        checkedText: '启用',
        uncheckedText: '禁用'
      }
    }
  ]
}
```

支持的 params：
- `checkedValue`: 选中时的值
- `uncheckedValue`: 未选中时的值
- `checkedText`: 选中时显示的文本
- `uncheckedText`: 未选中时显示的文本
- 其他 Switch 组件的属性

### TextareaRender

多行文本框，focus 时弹出 textarea，避免行高增加。

```typescript
const gridOptions = {
  columns: [
    {
      field: 'description',
      title: '描述',
      width: 200,
      ...EditRender.TextareaRender,
      params: {
        placeholder: '请输入描述内容'
      }
    }
  ]
}
```

支持的 params：
- `placeholder`: 占位符文本
- `autoSize`: textarea 自动调整大小配置，默认 `{ minRows: 3, maxRows: 6 }`
- 其他 Textarea 组件的属性

### BusinessSearchRender

业务搜索。

```typescript
const gridOptions = {
  columns: [
    {
      field: 'publicSearch',
      title: '公共弹窗',
      width: 200,
      ...EditRender.BusinessSearchRender,
      params: {
        cNum: 'XTGL_USER_ROLE',
        multiple: false,
        fieldNames: {
          label: 'C_ROLENAME',
          value: 'ID',
          desc: 'C_ROLENUMB'
        },
        mapping: {
          label: 'roleName',
          value: 'roleId',
          desc: 'roleNum'
        }
      }
    }
  ]
}
```

支持的 params：
- `cNum`: 弹窗编号
- `multiple`: 是否支持多选
- `fieldNames`: 弹窗已选项映射关系
- `mapping`: 弹窗确定时，反写到绑定数据
- 其他 `SunnyBusinessSearch` 组件的属性
