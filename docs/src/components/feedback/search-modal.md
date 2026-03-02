# SunnySearchModal 公共查询弹窗

基于配置驱动的通用查询弹窗组件，集成了搜索表单、分页表格、多选管理、已选列表展示等功能。

## 何时使用

- 需要在弹窗中进行数据查询和选择的场景
- 需要支持复杂搜索条件的数据选择
- 需要支持跨页多选的场景
- 需要快速选择（双击确认）的场景

## 代码演示

### 基础用法

通过 `formSchema` 配置搜索表单，`tableColumns` 配置表格列，`searchApi` 提供数据查询接口。

:::preview
demo-preview=./demos/search-modal/BasicUsage.vue
:::

### 设置默认值

在 `formSchema` 中通过 `defaultValue` 设置表单字段默认值。弹窗打开时，会先设置默认值再触发查询。

:::preview
demo-preview=./demos/search-modal/DefaultValue.vue
:::

### 自定义表单字段 Slot

当内置的表单组件无法满足需求时，可以使用 Slot 自定义表单字段渲染。只需在 `formSchema` 中将 `component` 设置为 `'Slot'`，然后通过同名 slot 自定义渲染。

:::preview
demo-preview=./demos/search-modal/CustomSlot.vue
:::

## 交互说明

### 表单校验

组件内置了表单校验机制，在以下场景会自动进行表单校验：

| 场景 | 校验行为 |
| --- | --- |
| 弹窗打开时 | 设置默认值 → 校验表单 → 校验通过才执行查询 |
| 点击查询按钮 | 重置分页为第一页 → 校验表单 → 校验通过才执行查询 |
| 点击重置按钮 | 重新初始化默认值 → 重置分页为第一页 → 校验表单 → 校验通过才执行查询 |

::: tip 校验流程
```
用户操作 → 触发表单校验 → 校验结果
                          ├── 通过 → 执行查询（loading = true）
                          └── 失败 → 显示错误信息，不执行查询，不触发 loading
```
:::

**校验规则配置：**

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
    rules: 'required', // 必填校验
    componentProps: {
      options: [
        { label: '类型A', value: 'A' },
        { label: '类型B', value: 'B' }
      ]
    }
  }
];
```

**支持的校验规则：**

| 规则名 | 说明 |
| --- | --- |
| `required` | 必填校验（适用于所有组件类型，包括 Input、Select 等） |
| Zod Schema | 支持使用 Zod 进行复杂校验 |

### 分页重置

点击「查询」或「重置」按钮时，分页会**自动重置为第一页**，避免因停留在非第一页导致查询不到数据的问题。

### 双击选择

- **单选模式**：双击表格行直接选中并关闭弹窗
- **多选模式**：双击表格行切换该行的选中状态（选中/取消选中），不关闭弹窗

### 跨页多选

组件支持跨页多选功能，翻页时会保留之前选中的数据。右侧已选列表实时展示所有已选数据，支持单个移除或清空全部。

**查询时保留已选数据：**

默认情况下（`clearOnSearch: false`），点击查询按钮不会清空已选数据，用户可以跨页累加选择。如果需要在每次查询时清空已选数据，可设置 `clearOnSearch: true`。

## API

### Props

| 参数名 | 说明 | 类型 | 默认值 | 必填 |
| --- | --- | --- | --- | --- |
| modelValue | 默认选中的数据，支持 v-model 双向绑定 | `Record<string, any>[]` | `[]` | 否 |
| visible | 弹窗显示状态，支持 v-model:visible | `boolean` | `false` | 是 |
| title | 弹窗标题 | `string` | `'数据查询'` | 否 |
| width | 弹窗宽度 | `string \| number` | `'800px'` | 否 |
| contentHeight | 内容区域高度（表格区域） | `string \| number` | `300` | 否 |
| formSchema | 搜索表单配置，参考 SunnyForm | `FormSchema[]` | - | **是** |
| tableColumns | 表格列配置，参考 VxeGrid | `VxeGridPropTypes.Columns` | - | **是** |
| searchApi | 数据查询接口 | `(params: SearchParams) => Promise<SearchResult>` | - | **是** |
| multiple | 是否多选 | `boolean` | `true` | 否 |
| rowKey | 数据主键字段名 | `string` | `'id'` | 否 |
| fieldNames | 字段映射配置，用于已选列表展示 | `FieldNames` | 见下方 | 否 |
| commonConfig | 表单通用配置，透传给 SunnyForm | `Record<string, any>` | 见下方 | 否 |
| helpMessage | 帮助提示文本，显示在标题栏 | `string` | `'支持跨页多选...'` | 否 |
| resetOnOpen | 是否在打开弹窗时重新查询表格数据 | `boolean` | `true` | 否 |
| clearOnSearch | 是否在点击查询按钮时清空已选数据 | `boolean` | `false` | 否 |

**fieldNames 默认值：**
```typescript
{ label: 'label', value: 'value', desc: 'desc' }
```

**commonConfig 默认值：**
```typescript
{ colProps: { xs: 24, sm: 12, md: 6, lg: 6, xl: 6, xxl: 6 } }
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
| `[fieldName]` | 自定义表单字段，需在 formSchema 中设置 `component: 'Slot'` | [SlotProps](#slotprops) |

### Exposes

组件通过 `defineExpose` 暴露以下方法，可通过 ref 调用：

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| reset | 重置表格数据和已选数据，清空表格、已选列表，并重置分页 | - | `void` |

**使用示例：**

```vue
<template>
  <SunnySearchModal ref="modalRef" ... />
  <Button @click="handleReset">重置</Button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const modalRef = ref();

const handleReset = () => {
  modalRef.value?.reset();
};
</script>
```

### searchApi

`searchApi` 是数据查询的核心接口，组件会自动传入分页参数和表单字段。

**请求参数：**

```typescript
interface SearchParams {
  pageNo: number;      // 当前页码，从 1 开始
  pageSize: number;    // 每页条数，默认 200
  [key: string]: any;  // 表单字段（包含默认值和用户输入）
}
```

**返回格式：**

```typescript
interface SearchResult {
  list: any[];      // 数据列表（也支持 records 字段）
  total: number;    // 总数（也支持 totalCount 字段）
}
```

**示例：**

```typescript
const searchApi = async (params) => {
  const { pageNo, pageSize, keyword, status } = params;

  // 调用后端接口
  const res = await requestClient.get('/api/data/list', {
    params: { pageNo, pageSize, keyword, status }
  });

  // 返回标准格式
  return {
    list: res.data.records,
    total: res.data.total
  };
};
```

### FieldNames

用于指定已选列表中数据的显示字段：

```typescript
interface FieldNames {
  label: string;  // 主要显示的文本字段（第一行）
  value: string;  // 值字段（第二行，通常显示编码或ID）
  desc?: string;  // 辅助描述字段（可选，第三行）
}
```

**示例：**

```typescript
// 数据结构
const data = { id: 1, name: '张三', code: 'ZS001', dept: '技术部' };

// 配置
<FieldNames label="name" value="code" desc="dept" />

// 已选列表显示：
// 张三
// ZS001
// 技术部
```

### SlotProps

自定义表单字段 Slot 接收的参数：

```typescript
interface SlotProps {
  value: any;                            // 当前字段值
  setValue: (val: any) => void;          // 更新字段值的方法
  model: Record<string, any>;            // 整个表单的值对象
  disabled: boolean;                     // 是否禁用
  errorMessage?: string;                 // 验证错误信息
  componentProps: Record<string, any>;   // 组件属性（来自 formSchema.componentProps）
}
```

**使用示例：**

```vue
<template>
  <SunnySearchModal :form-schema="formSchema" v-model="selected" v-model:visible="visible">
    <!-- 自定义数字输入字段 -->
    <template #amount="{ value, setValue, disabled }">
      <a-input-number
        :value="value"
        :disabled="disabled"
        :min="0"
        :max="9999"
        :precision="2"
        @change="setValue"
      />
    </template>
  </SunnySearchModal>
</template>

<script setup lang="ts">
const formSchema = [
  {
    fieldName: 'amount',       // 对应 slot 名称 #amount
    label: '金额',
    component: 'Slot',         // 必须设置为 'Slot'
    componentProps: {
      min: 0,
      max: 9999,
      precision: 2
    }
  }
];
</script>
```

## 常见问题

### 1. 为什么打开弹窗时没有触发查询？

可能原因：
- 表单校验未通过（如必填字段为空）
- `searchApi` 未正确配置

### 2. 如何实现单选模式？

设置 `multiple` 为 `false`：

```vue
<SunnySearchModal :multiple="false" ... />
```

### 3. 如何自定义表格的高度？

通过 `contentHeight` 属性设置：

```vue
<SunnySearchModal :content-height="400" ... />
<!-- 或 -->
<SunnySearchModal content-height="50vh" ... />
```

### 4. 如何监听用户选择的数据？

使用 `confirm` 事件或 `v-model`：

```vue
<template>
  <SunnySearchModal
    v-model="selected"
    @confirm="handleConfirm"
    ...
  />
</template>

<script setup>
const selected = ref([]);

const handleConfirm = (values) => {
  console.log('用户选择了：', values);
};
</script>
```
