# SearchPlan 查询方案

组合式业务组件，用于管理和切换查询方案，集成了 `SunnyUseForm` 和 `Modal`，支持保存、加载和管理多个查询条件方案。

## 基础用法

通过 `v-model:model` 双向绑定表单数据，使用 `form-config` 配置表单结构。

<preview path="./demos/search-plan/BasicUsage.vue" />

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 双向绑定的表单数据 | `object` | `{}` |
| model | 表单数据 (兼容写法) | `object` | `{}` |
| formConfig | 表单配置 | `array` | `[]` |
| searchPlanList | 查询方案列表 | `array` | `[]` |
| currentSearchPlan | 当前选中的查询方案 | `object` | `undefined` |
| resourceId | 资源ID | `string` | - |
| nResourceid | 资源编号 | `number` | - |
| loading | 加载状态 | `boolean` | `false` |
| title | 弹窗标题 | `string` | `'查询方案'` |
| width | 弹窗宽度 | `string \| number` | `900` |
| formProps | 透传给 SunnyUseForm 的属性 | `object` | `{}` |
| modalProps | 透传给 Modal 的属性 | `object` | `{}` |
| disabled | 是否禁用 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:modelValue | 更新绑定值 | `(value: object)` |
| update:model | 更新绑定值 (兼容写法) | `(value: object)` |
| search | 执行搜索时触发 | `(values: object)` |
| add | 新增方案时触发 | `(name: string, model: object)` |
| update | 更新方案时触发 | `(id: string \| number, name: string, model: object)` |
| delete | 删除方案时触发 | `(id: string \| number)` |
| select | 选择方案时触发 | `(plan: object)` |
| reset | 重置表单时触发 | - |
| default-plan-loaded | 默认查询方案加载完成 | `(model: object)` |

### Methods

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| open | 打开弹窗 | - |
| close | 关闭弹窗 | - |
| reset | 重置表单 | - |
| search | 执行搜索 | - |
| add | 新增查询方案 | - |
| update | 更新查询方案 | - |
| delete | 删除查询方案 | `(plan: object)` |
| select | 选择查询方案 | `(plan: object)` |

## 使用场景

### 1. 基本查询方案管理

```vue
<template>
  <div>
    <button @click="searchPlanRef?.open()">打开查询方案</button>
    <SunnySearchPlan
      ref="searchPlanRef"
      v-model:model="formData"
      :form-config="formConfig"
      :search-plan-list="searchPlanList"
      v-model:current-search-plan="currentSearchPlan"
      :loading="loading"
      @add="handleAdd"
      @update="handleUpdate"
      @delete="handleDelete"
      @select="handleSelect"
      @search="handleSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { SunnySearchPlan } from '@ui';
import { Message } from '@arco-design/web-vue';

const searchPlanRef = ref<InstanceType<typeof SunnySearchPlan>>();
const formData = reactive({
  name: '',
  age: undefined,
  gender: ''
});

const searchPlanList = ref([
  {
    ID: 1,
    CSEARCHPLANNAME: '全部用户'
  },
  {
    ID: 2,
    CSEARCHPLANNAME: '男性用户'
  },
  {
    ID: 3,
    CSEARCHPLANNAME: '女性用户'
  }
]);

const currentSearchPlan = ref(undefined);
const loading = ref(false);

const formConfig = [
  {
    fieldName: 'name',
    component: 'Input',
    label: '姓名',
    componentProps: {
      placeholder: '请输入姓名'
    }
  },
  {
    fieldName: 'age',
    component: 'InputNumber',
    label: '年龄',
    componentProps: {
      min: 0,
      max: 100
    }
  },
  {
    fieldName: 'gender',
    component: 'Select',
    label: '性别',
    componentProps: {
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]
    }
  }
];

// 事件处理函数
const handleAdd = async (name, formModel) => {
  loading.value = true;
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newPlan = {
      ID: Date.now(),
      CSEARCHPLANNAME: name
    };
    searchPlanList.value.push(newPlan);
    currentSearchPlan.value = newPlan;
    Message.success('新增查询方案成功');
  } catch (error) {
    console.error('新增查询方案失败:', error);
    Message.error('新增查询方案失败');
  } finally {
    loading.value = false;
  }
};

const handleUpdate = async (id, name, formModel) => {
  loading.value = true;
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const index = searchPlanList.value.findIndex(item => item.ID === id);
    if (index !== -1) {
      searchPlanList.value[index].CSEARCHPLANNAME = name;
    }
    Message.success('覆盖查询方案成功');
  } catch (error) {
    console.error('覆盖查询方案失败:', error);
    Message.error('覆盖查询方案失败');
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id) => {
  loading.value = true;
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (currentSearchPlan.value && currentSearchPlan.value.ID === id) {
      currentSearchPlan.value = undefined;
    }
    searchPlanList.value = searchPlanList.value.filter(item => item.ID !== id);
    Message.success('删除查询方案成功');
  } catch (error) {
    console.error('删除查询方案失败:', error);
    Message.error('删除查询方案失败');
  } finally {
    loading.value = false;
  }
};

const handleSelect = (plan) => {
  currentSearchPlan.value = plan;
  // 根据选择的方案设置表单值
  // ...
  Message.success('切换查询方案成功');
};

const handleSearch = (values) => {
  console.log('搜索参数:', values);
  // 执行搜索逻辑
  Message.success('搜索执行成功');
};
</script>
```

### 2. 自定义配置

```vue
<template>
  <div>
    <button @click="searchPlanRef?.open()">打开高级查询方案</button>
    <SunnySearchPlan
      ref="searchPlanRef"
      v-model:model="formData"
      :form-config="formConfig"
      :title="'高级查询方案'"
      :width="800"
      :form-props="{ labelWidth: 120 }"
      :modal-props="{ showCancel: true }"
      @search="handleSearch"
      @add="handleAddPlan"
      @update="handleUpdatePlan"
      @delete="handleDeletePlan"
      @select="handleSelectPlan"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SunnySearchPlan } from '@ui';

const searchPlanRef = ref<InstanceType<typeof SunnySearchPlan>>();
const formData = ref({});

const formConfig = [
  {
    fieldName: 'startDate',
    component: 'DatePicker',
    label: '开始日期',
    componentProps: {
      type: 'date'
    }
  },
  {
    fieldName: 'endDate',
    component: 'DatePicker',
    label: '结束日期',
    componentProps: {
      type: 'date'
    }
  },
  {
    fieldName: 'status',
    component: 'Select',
    label: '状态',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' }
      ]
    }
  }
];

// 事件处理函数
const handleSearch = (values) => {
  console.log('搜索参数:', values);
};

const handleAddPlan = (plan) => {
  console.log('新增方案:', plan);
};

const handleUpdatePlan = (plan) => {
  console.log('更新方案:', plan);
};

const handleDeletePlan = (planId) => {
  console.log('删除方案:', planId);
};

const handleSelectPlan = (plan) => {
  console.log('选择方案:', plan);
};
</script>
```

## 高级特性

### 1. 方案管理

- **新增方案**：保存当前表单配置为新方案，新增后自动切换到该方案
- **覆盖方案**：更新现有方案的配置，必须先选中一个方案
- **删除方案**：移除不需要的方案，删除当前选中的方案后自动清除选中状态
- **选择方案**：加载已保存的方案配置，同时更新表单数据

### 2. 表单数据同步

组件内部自动同步 `modelValue` 和 `model` 的值，确保双向绑定生效。当选择不同的查询方案时，表单数据会自动切换。

### 3. 操作反馈

所有操作都会通过 `Message` 组件提供明确的反馈信息，包括成功提示和错误提示。

### 4. 加载状态管理

组件支持 `loading` 属性，用于显示 API 调用期间的加载状态，防止用户在操作期间进行其他操作。

### 5. 弹窗初始化

打开弹窗时，组件会自动：
- 清空表单数据和清除查询方案选中状态
- 加载查询方案列表
- 如果查询方案列表长度大于0，自动选中第一个查询方案并加载其配置

### 6. 业务搜索字段支持

组件专门支持 `SunnyBusinessSearch` 组件：
- 保存时将业务搜索字段的完整对象数组转换为 JSON 字符串
- 加载时将 JSON 字符串解析回对象数组
- 处理服务器返回的特殊格式数据，确保业务搜索字段正确显示

### 7. 智能数据处理

- **数组值处理**：自动将数组类型的值转换为字符串数组，确保数据一致性
- **对象值提取**：从对象中智能提取值（优先使用 value、ID、id 属性）
- **空值检查**：检查是否有查询条件，避免保存空方案
- **错误处理**：优雅处理 JSON 解析失败等异常情况

## 注意事项

1. **表单配置**：`formConfig` 需要符合 `SunnyUseForm` 的配置格式，确保表单能够正确渲染。

2. **数据结构**：`modelValue` 和 `model` 应该是一个对象，用于存储表单字段的键值对。`searchPlanList` 应该是一个数组，每个元素包含 `ID` 和 `CSEARCHPLANNAME` 属性。

3. **事件处理**：建议监听 `search` 事件来执行实际的搜索逻辑，组件会在触发搜索后自动关闭弹窗。监听 `add`、`update`、`delete` 和 `select` 事件来处理方案管理相关的逻辑。

4. **方案存储**：组件内部使用内存存储方案数据，刷新页面后会丢失。如果需要持久化存储，建议监听 `add`、`update` 和 `delete` 事件，将方案数据保存到后端或本地存储。

5. **加载状态**：在执行 API 调用时，建议设置 `loading` 为 `true`，提供更好的用户体验。API 调用完成后，无论成功还是失败，都应该设置 `loading` 为 `false`。

6. **业务搜索字段**：对于 `SunnyBusinessSearch` 组件，组件会自动处理其特殊数据格式，无需额外配置。

7. **数据格式**：组件会自动处理各种数据格式，包括数组、对象和字符串，确保数据在保存和加载时的一致性。

8. **空值检查**：组件会自动检查是否有查询条件，避免保存空方案。如果需要保存空方案，需要在业务逻辑中特殊处理。