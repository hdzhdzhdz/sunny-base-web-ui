---
outline: [2, 3]
---

# Form 表单

基于 Arco Design 的 Form 组件封装，提供了 schema 驱动的表单生成能力，简化了复杂表单的开发。

## 使用模式

Form 组件支持两种使用模式：**Hook 模式** 和 **组件模式**。

### Hook 模式 (推荐)

使用 `useSunnyForm` 创建表单。

**适用场景：**
- 需要在外部通过 API (如 `formApi`) 灵活控制表单（提交、重置、设置值、校验等）。
- 复杂表单，需要处理联动、动态更新 Schema 等逻辑。
- 习惯 React Hook 风格或希望逻辑与 UI 分离。


## 基础用法 (Basic)

最简单的表单使用方式，包含基础布局和字段配置。

<preview path="./demos/form/Basic.vue" title="基础用法" description="包含文本框、下拉框等基础组件，展示默认布局效果。" />

## 支持的组件 (Components)

SunnyForm 内置了以下表单组件，通过 `component` 属性指定：

### 输入类

| 组件名 | 说明 | 对应 Arco 组件 |
| --- | --- | --- |
| `Input` | 文本输入框 | `a-input` |
| `InputPassword` | 密码输入框 | `a-input-password` |
| `InputNumber` | 数字输入框 | `a-input-number` |
| `Textarea` | 多行文本框 | `a-textarea` |

### 选择类

| 组件名 | 说明 | 对应 Arco 组件 |
| --- | --- | --- |
| `Select` | 下拉选择框 | `a-select` |
| `Checkbox` | 复选框 | `a-checkbox` |
| `CheckboxGroup` | 复选框组 | `a-checkbox-group` |
| `Radio` | 单选框 | `a-radio` |
| `RadioGroup` | 单选框组 | `a-radio-group` |
| `Switch` | 开关 | `a-switch` |
| `Cascader` | 级联选择 | `a-cascader` |
| `TreeSelect` | 树选择 | `a-tree-select` |

### 日期时间类

| 组件名 | 说明 | 对应 Arco 组件 |
| --- | --- | --- |
| `DatePicker` | 日期选择器 | `a-date-picker` |
| `RangePicker` | 日期范围选择器 | `a-range-picker` |
| `TimePicker` | 时间选择器 | `a-time-picker` |

### 其他

| 组件名 | 说明 | 对应 Arco 组件 |
| --- | --- | --- |
| `Upload` | 文件上传 | `a-upload` |
| `Rate` | 评分 | `a-rate` |
| `Slider` | 滑动条 | `a-slider` |
| `Slot` | 字段插槽渲染 | - |
| `SunnyBusinessSearch` | 业务搜索组件 | - |

### 使用示例

```typescript
const schema = [
  { fieldName: 'name', label: '名称', component: 'Input' },
  { fieldName: 'password', label: '密码', component: 'InputPassword' },
  { fieldName: 'age', label: '年龄', component: 'InputNumber' },
  { fieldName: 'status', label: '状态', component: 'Select' },
  { fieldName: 'enabled', label: '启用', component: 'Switch' },
  { fieldName: 'birthday', label: '生日', component: 'DatePicker' },
  { fieldName: 'dateRange', label: '日期范围', component: 'RangePicker' },
  { fieldName: 'avatar', label: '头像', component: 'Upload' },
];
```

## 组件属性 (ComponentProps)

`componentProps` 用于配置表单组件的属性，支持**静态配置**和**动态配置**两种方式。

### 静态配置

直接传递对象，适用于固定属性：

```typescript
const schema = [
  {
    fieldName: 'username',
    label: '用户名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入用户名',
      maxLength: 20,
      allowClear: true,
    },
  },
  {
    fieldName: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' },
      ],
    },
  },
];
```

### 动态配置（函数形式）

使用函数根据其他字段值动态计算属性，实现字段联动：

```typescript
const schema = [
  {
    fieldName: 'userType',
    label: '用户类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: '个人', value: 'personal' },
        { label: '企业', value: 'enterprise' },
      ],
    },
  },
  {
    fieldName: 'companyName',
    label: '公司名称',
    component: 'Input',
    // ✅ 函数形式：根据 userType 动态设置属性
    componentProps: (values, formApi) => ({
      placeholder: values.userType === 'enterprise' ? '请输入公司全称' : '请输入姓名',
      disabled: !values.userType, // 未选择类型时禁用
      // ✅ 可以使用 formApi 执行更复杂的操作
      onChange: (value) => {
        console.log('当前值:', value);
        // 联动设置其他字段
        if (values.userType === 'enterprise' && value) {
          formApi.setFieldValue('needLicense', true);
        }
      },
    }),
  },
];
```

### 函数参数说明

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `values` | `Record<string, any>` | 当前表单所有字段的值 |
| `formApi` | `FormApi` | 表单 API 实例，提供 `setFieldValue`、`setValues` 等方法 |

### 常见使用场景

#### 1. 级联下拉框

```typescript
{
  fieldName: 'province',
  label: '省份',
  component: 'Select',
  componentProps: {
    options: provinceOptions,
  },
},
{
  fieldName: 'city',
  label: '城市',
  component: 'Select',
  componentProps: (values) => ({
    options: getCityOptions(values.province), // 根据省份动态获取城市列表
    disabled: !values.province, // 未选择省份时禁用
    placeholder: values.province ? '请选择城市' : '请先选择省份',
  }),
}
```

#### 2. 条件禁用

```typescript
{
  fieldName: 'reason',
  label: '审批意见',
  component: 'Textarea',
  componentProps: (values) => ({
    disabled: values.status === 'completed', // 已完成时禁用
    placeholder: values.status === 'completed' ? '已完成，不可修改' : '请输入审批意见',
  }),
}
```

#### 3. 联动设置其他字段

```typescript
{
  fieldName: 'userId',
  label: '用户',
  component: 'SunnyBusinessSearch',
  componentProps: (_values, formApi) => ({
    type: 'user',
    onChange: (selectedUsers) => {
      if (selectedUsers.length > 0) {
        // ✅ 通过 formApi 联动设置其他字段
        formApi.setFieldValue('userName', selectedUsers[0].name);
        formApi.setFieldValue('userEmail', selectedUsers[0].email);
        formApi.setFieldValue('userDept', selectedUsers[0].dept);
      }
    },
  }),
}
```

### 与 dependencies.componentProps 的区别

| 特性 | schema.componentProps | dependencies.componentProps |
| --- | --- | --- |
| **优先级** | 较低 | 较高（会覆盖 schema.componentProps） |
| **适用场景** | 基础属性配置 | 联动逻辑更清晰，可配合其他 dependencies 选项 |
| **执行时机** | 组件初始化时 | 依赖字段变化时重新计算 |

**推荐使用 `dependencies.componentProps`** 处理复杂的联动逻辑，代码更清晰：

```typescript
{
  fieldName: 'companyName',
  label: '公司名称',
  component: 'Input',
  dependencies: {
    show: (values) => values.userType === 'enterprise',
    required: (values) => values.userType === 'enterprise',
    componentProps: (values) => ({
      placeholder: '请输入公司全称',
    }),
  },
}
```

## 字段插槽 (Field Slots)

SunnyForm 支持字段级别的插槽，允许你完全自定义某个字段的渲染方式，支持双向绑定。

<preview path="./demos/form/Slots.vue" title="字段插槽演示" description="展示字段级别插槽的使用方式。" />

### 使用方式

设置 `component: 'Slot'` 启用字段插槽，插槽名为 `fieldName`。

```vue
<script setup lang="ts">
const [Form] = useSunnyForm({
  schema: [
    { fieldName: 'tags', label: '标签', component: 'Slot' },
  ],
});
</script>

<template>
  <Form>
    <!-- 插槽名 = fieldName -->
    <template #tags="{ model, value, setValue, disabled }">
      <a-tag v-for="tag in value" :key="tag" closable>{{ tag }}</a-tag>
      <a-button @click="setValue([...value, '新标签'])" :disabled="disabled">添加</a-button>
      <!-- model 可访问整个表单的值 -->
    </template>
  </Form>
</template>
```

### 字段插槽参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `model` | `Record<string, any>` | 整个表单的值对象，支持跨字段访问 |
| `value` | `any` | 当前字段值 |
| `setValue` | `(value: any) => void` | 更新当前字段值的函数（双向绑定） |
| `disabled` | `boolean` | 是否禁用 |
| `errorMessage` | `string \| undefined` | 验证错误信息 |

## 字段联动 (Dependencies)

SunnyForm 支持强大的字段联动能力，通过 `dependencies` 配置实现字段间的动态控制，包括显示/隐藏、禁用/启用、必填/非必填、动态属性等。

<preview path="./demos/form/Dependencies.vue" title="字段联动演示" description="展示字段间的动态控制：显示隐藏、必填控制、禁用状态、动态属性。" />

### 使用方式

在 schema 中通过 `dependencies` 配置字段联动。Vue 会自动追踪依赖，无需手动指定监听字段：

```typescript
{
  fieldName: 'companyName',
  label: '公司名称',
  component: 'Input',
  dependencies: {
    // Vue 会自动检测 show 函数中访问了 values.userType
    // 当 userType 变化时，自动重新计算
    show: (values) => values.userType === 'enterprise',
    required: (values) => values.userType === 'enterprise',
    componentProps: (values) => ({
      placeholder: values.userType === 'enterprise' ? '请输入公司全称' : '',
    }),
  },
}
```

> 💡 **自动依赖追踪**：无需指定 `triggerFields`，Vue 的响应式系统会自动检测函数中访问了哪些字段，只有这些字段变化时才会重新计算。

### dependencies 配置项

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `triggerFields` | `string[]` | **(已废弃)** 监听的字段名数组。现在不再需要，Vue 会自动追踪依赖 |
| `if` | `(values, formApi) => boolean` | 是否渲染 DOM (v-if)，返回 false 时字段不渲染 |
| `show` | `(values, formApi) => boolean` | 是否显示 (v-show)，返回 false 时字段隐藏 |
| `required` | `(values, formApi) => boolean` | 是否必填，控制表单验证的必填星号和规则 |
| `disabled` | `(values, formApi) => boolean` | 是否禁用 |
| `rules` | `(values, formApi) => Rule` | 动态验证规则，可根据其他字段值返回不同的验证规则 |
| `componentProps` | `(values, formApi) => object` | 动态组件属性，可根据其他字段值动态设置 placeholder、options 等 |

### 联动执行顺序

联动逻辑按以下顺序执行，一旦某一步返回 false，后续步骤将不再执行：

1. **if** → 如果返回 false，不渲染 DOM，后续跳过
2. **show** → 如果返回 false，隐藏字段，后续跳过
3. **componentProps** → 动态计算组件属性
4. **rules** → 动态计算验证规则
5. **disabled** → 计算禁用状态
6. **required** → 计算必填状态
7. **trigger** → 执行自定义触发器

### 常见场景

#### 1. 条件显示/隐藏

```typescript
{
  fieldName: 'invoiceTitle',
  label: '发票抬头',
  component: 'Input',
  dependencies: {
    show: (values) => values.needInvoice === true,
  },
}
```

#### 2. 条件必填

```typescript
{
  fieldName: 'companyName',
  label: '公司名称',
  component: 'Input',
  dependencies: {
    required: (values) => values.userType === 'enterprise',
  },
}
```

#### 3. 动态验证规则

```typescript
{
  fieldName: 'confirmPassword',
  label: '确认密码',
  component: 'InputPassword',
  dependencies: {
    rules: (values) => {
      return z.string().refine((val) => val === values.password, {
        message: '两次密码不一致',
      });
    },
  },
}
```

#### 4. 动态组件属性

```typescript
{
  fieldName: 'city',
  label: '城市',
  component: 'Select',
  dependencies: {
    componentProps: (values) => ({
      options: getCityOptions(values.province),
      loading: !values.province,
    }),
  },
}
```

#### 5. 多字段联动

当联动逻辑依赖多个字段时，Vue 会自动追踪所有访问的字段：

```typescript
{
  fieldName: 'shippingFee',
  label: '运费',
  component: 'InputNumber',
  dependencies: {
    // 访问了 express, weight, vipUser 三个字段
    // 任何一个变化都会触发重新计算
    componentProps: (values) => {
      const baseFee = values.express ? 10 : 5;
      const weightFee = (values.weight || 0) * 2;
      const discount = values.vipUser ? 0.8 : 1;
      return {
        modelValue: Math.round(baseFee + weightFee) * discount,
        disabled: true,
      };
    },
  },
}
```

## 布局与样式 (Layout & Style)

SunnyForm 基于 Arco Design 的 24 栅格系统，支持强大的响应式布局能力。

### 演示效果

<preview path="./demos/form/Layout.vue" title="布局与样式演示" description="包含响应式配置、Layout 切换 (Horizontal/Vertical/Inline) 以及 LabelWidth 设置 (固定/Auto)。" />

### 核心概念

- **Span (跨度)**: 范围 1-24。`24` 为满宽，`12` 为半宽，`8` 为 1/3 宽。
- **Breakpoints (断点)**: 自动适配不同设备 (xs, sm, md, lg, xl, xxl)。

### 配置指南

#### 1. 全局配置 (推荐)
在 `commonConfig` 中设置，一处配置，全局生效。

```typescript
commonConfig: {
  colProps: { 
    // 默认（兜底）：一行一个
    span: 24, 
    // 中屏：一行两个
    md: 12, 
    // 大屏：一行三个
    lg: 8,
    // 超大屏：一行四个
    xxl: 6
  }
}
```

#### 2. 个性化配置
在 `schema` 中单独覆盖。

```typescript
schema: [
  // 普通字段：跟随全局配置
  { fieldName: 'name', component: 'Input' },
  
  // 特殊字段：强制独占一行
  { fieldName: 'desc', component: 'Textarea', colProps: { span: 24 } }
]
```

#### 3. 栅格级联规则 (Cascade)

响应式配置遵循 **向下继承** 原则：较小断点的配置会自动应用到较大断点，直到被显式覆盖。

**示例：** 假设配置为 `{ md: 12, xxl: 6 }`

| 断点 | xs | sm | md | lg | xl | xxl |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **生效栅格** | 24 (默认) | 24 (默认) | **12** (设置) | 12 (继承) | 12 (继承) | **6** (覆盖) |

## 操作栏与按钮 (Actions)

提供灵活的操作栏配置，支持自定义按钮位置、布局和样式。

<preview path="./demos/form/Actions.vue" title="操作栏配置" description="展示操作按钮居右 (actionPosition)、行内布局 (actionLayout) 以及自定义按钮样式。" />

### 布局规则

- **自动对齐**：默认情况下，操作栏的栅格大小会自动继承 `commonConfig.colProps` 的配置，保证网格对齐。
- **手动控制**：通过 `actionColProps` 属性显式指定操作栏的栅格配置。
- **位置跟随**：操作栏始终会紧跟在最后一个可见字段之后。

### 按钮显示控制

SunnyForm 支持多层次的按钮显示控制：

#### 1. 隐藏整个操作栏

通过 `showDefaultActions` 控制，默认为 `true`。

```typescript
const [Form] = useSunnyForm({
  showDefaultActions: false,  // 隐藏整个操作栏
  schema: [...]
});
```

#### 2. 隐藏单个按钮

通过 `submitButtonOptions.show` 和 `resetButtonOptions.show` 单独控制。

```typescript
const [Form] = useSunnyForm({
  submitButtonOptions: {
    show: false,  // 隐藏提交按钮
    content: '搜索',
  },
  resetButtonOptions: {
    show: false,  // 隐藏重置按钮
    content: '清空',
  },
  schema: [...]
});
```

#### 3. 动态控制

使用 `formApi.setState()` 动态更新配置。

```typescript
const [Form, formApi] = useSunnyForm({ schema: [...] });

// 动态隐藏提交按钮
formApi.setState({
  submitButtonOptions: { show: false }
});

// 动态显示整个操作栏
formApi.setState({
  showDefaultActions: true
});
```

### 操作栏插槽

SunnyForm 提供了操作栏区域的自定义插槽，方便在默认按钮前后插入自定义内容，或完全替换操作栏。

#### 按钮前后插槽

| 插槽名 | 说明 |
| --- | --- |
| `submit-before` | 提交按钮前的插槽，可用于添加自定义按钮或内容 |
| `reset-before` | 重置按钮前的插槽，可用于添加自定义按钮或内容 |
| `expand-before` | 展开/收起按钮前的插槽 |
| `expand-after` | 展开/收起按钮后的插槽 |

#### 自定义整个操作栏

使用 `actions` 插槽可以完全替换默认的操作栏。

```vue
<template>
  <Form>
    <template #actions="{ collapsed, formApi }">
      <a-button type="primary" @click="formApi.submitForm()">自定义提交</a-button>
      <a-button @click="formApi.resetForm()">自定义重置</a-button>
    </template>
  </Form>
</template>
```

| 插槽名 | 参数 | 说明 |
| --- | --- | --- |
| `actions` | `{ collapsed, formApi }` | 完全替换默认操作栏。`collapsed` 为当前折叠状态，`formApi` 为表单 API 实例 |

## 折叠功能 (Collapse)

在处理复杂的查询表单时，我们通常需要折叠非核心查询条件。

<preview path="./demos/form/Collapse.vue" title="折叠功能" description="默认只显示第一行，点击展开查看所有字段。支持外部按钮控制折叠状态。" />

### 布局规则

- **展开时**：显示所有字段。
- **折叠时**：根据 `collapsedRows`（默认 1 行）计算显示的高度，超出部分自动隐藏。

## 表单校验 (Validation)

支持多种校验方式，包括字符串简写、Zod Schema 以及动态规则。

<preview path="./demos/form/Validation.vue" title="校验演示" description="包含必填、格式校验、自定义校验以及字段间的一致性校验。" />

### 校验规则说明

- **字符串规则**：使用 `vee-validate` 风格的字符串简写。
  - **单规则**：如 `'required'`。
  - **组合规则**：支持使用 `|` 组合多个规则，例如 `'required|phone'` (必填且必须是手机号)。
- **Zod Schema**：使用 `zod` 定义强大的类型校验规则，支持链式调用和自定义消息。
- **动态规则**：通过 `dependencies.rules` 配置函数，根据表单当前值动态生成校验规则 (常用于密码确认等场景)。
- **个性化规则注入**：
  - 为了避免全局污染，推荐使用 `setupSunnyForm` 在组件级按需注入规则。
  - 支持直接注入 `@sunny-base-web/utils` 中的常用正则模式。

### 常用正则规则

`@sunny-base-web/utils/regex` 提供了丰富的常用正则模式 (如 `phone`, `email`, `idCard` 等)。

你可以通过 `setupSunnyForm` 将这些模式批量注册为字符串规则，从而在 Schema 中便捷使用。

> 💡 **相关文档**：
> - 查看完整的内置正则规则列表，请参考 [Regex 正则表达式](/utilities/regex.html)

## 交互与事件 (Interaction & Events)

支持回车提交、值变更监听等丰富的交互能力。

<preview path="./demos/form/Interaction.vue" title="交互演示" description="尝试在输入框回车，或改变下拉框的值，观察自动提交和事件回调。" />

### 监听表单变化

SunnyForm 提供了多种方式监听表单值的变化：

<preview path="./demos/form/Change.vue" title="事件监听演示" description="操作表单查看全局监听和字段级别监听的事件触发。" />

#### 方式1：全局监听（推荐）

使用 `handleValuesChange` 监听整个表单的值变化，任意字段变化都会触发：

```typescript
const [Form] = useSunnyForm({
  schema: [
    { fieldName: 'name', label: '名称', component: 'Input' },
    { fieldName: 'type', label: '类型', component: 'Select' },
  ],
  handleValuesChange: (values, changedFields) => {
    console.log('当前表单值:', values);
    console.log('变化的字段:', changedFields);
  },
});
```

#### 方式2：字段级别监听

在 `componentProps` 中配置 Arco 组件原生的事件，只监听特定字段：

```typescript
const [Form] = useSunnyForm({
  schema: [
    {
      fieldName: 'type',
      label: '类型',
      component: 'Select',
      componentProps: {
        options: [...],
        // Select 组件的 change 事件
        onChange: (value) => {
          console.log('type 变化了:', value);
        },
      },
    },
    {
      fieldName: 'name',
      label: '名称',
      component: 'Input',
      componentProps: {
        // Input 组件的 input 事件
        onInput: (value) => {
          console.log('name 输入:', value);
        },
      },
    },
  ],
});
```

#### 方式3：值变化自动提交

使用 `submitOnChange` 在任意字段变化时自动触发表单提交：

```typescript
const [Form] = useSunnyForm({
  submitOnChange: true,  // 开启自动提交
  schema: [...],
  handleSubmit: (values) => {
    console.log('自动提交:', values);
  },
});
```

### 常用事件对比

| 方式 | 适用场景 | 触发时机 |
| --- | --- | --- |
| `handleValuesChange` | 监听整个表单变化、联动逻辑 | 任意字段值变化 |
| `componentProps.onChange` | 监听单个字段、执行特定逻辑 | 特定字段变化 |
| `submitOnChange` | 搜索表单、自动刷新场景 | 任意字段变化后自动提交 |

> 💡 **提示**：对于 Arco 组件，`Input` 使用 `onInput`，`Select`、`Switch`、`Checkbox` 等使用 `onChange`。具体事件请参考 [Arco Design 文档](/arco-llm.txt)。

## 数据转换 (Data Transformation)

SunnyForm 提供了内置的数据转换机制，方便在表单值（通常是数组或复杂对象）与后端接口字段（通常是扁平化字段）之间进行自动映射。

### 时间范围映射 (Field Mapping Time)

将时间范围选择器（RangePicker）的数组值自动拆分为开始时间和结束时间两个字段。

```typescript
// 配置示例
fieldMappingTime: [
  // 1. 基础用法
  // 将 dateRange 字段的值 [start, end] 映射为 startDate 和 endDate
  // 第三个参数为时间格式，默认为 'YYYY-MM-DD'
  ['dateRange', ['startDate', 'endDate'], 'YYYY-MM-DD'],
  
  // 2. 自定义格式
  ['monthRange', ['startMonth', 'endMonth'], 'YYYY-MM'],

  // 3. 保持原始对象 (不格式化)
  ['rawRange', ['rawStart', 'rawEnd'], null],
  
  // 4. 自定义转换函数
  ['createTime', ['createStart', 'createEnd'], (time) => time.valueOf()],
]
```

### 数组转字符串 (Array To String)

将多选组件（CheckboxGroup, Select Multiple）的数组值转换为分隔符连接的字符串。

```typescript
// 配置示例
arrayToStringFields: [
  // 1. 简单配置 (默认使用逗号分隔)
  // 将 hobbies 字段转换为逗号分隔的字符串
  'hobbies', 
  
  // 2. 批量配置 (最后一个元素为分隔符)
  // tags 和 categories 都会使用 '|' 分隔
  ['tags', 'categories', '|'],

  // 3. 嵌套配置 (针对单个字段指定分隔符)
  [['labels'], ';']
]
```

## 全局 Disabled 配置

SunnyForm 提供了**五层优先级**的表单禁用控制机制，支持从应用级到字段级的灵活控制。

### 五层优先级（从高到低）

```
1. dependencies.disabled     (最高优先级 - 动态联动)
   ↓
2. schema.disabled           (字段级配置)
   ↓
3. componentProps.disabled   (组件属性配置)
   ↓
4. commonConfig.disabled     (表单级配置 - 新增)
   ↓
5. FormCommonConfig.disabled (全局级配置 - 新增，最低优先级)
```

**优先级规则：** 范围越小，优先级越高

### 使用场景

#### 1. 全局禁用（应用级）

在应用启动时配置全局默认禁用状态，适用于权限控制、系统维护等场景：

```typescript
// apps/web/src/bootstrap.ts
import { setupBusinessForm } from '@sunny-base-web/effects';

async function bootstrap() {
  setupBusinessForm({
    config: {
      disabled: false,  // 默认不禁用
      // disabled: authStore.isReadOnly,  // 根据权限动态控制
    }
  });
}
```

**适用场景：**
- ✅ 审批流程（根据权限动态控制）
- ✅ 系统维护模式（全局只读）
- ✅ 特定用户角色（访客只读）

#### 2. 表单级禁用

在单个表单中统一控制所有字段，适用于详情页、审批页等：

**组件模式：**

```vue
<template>
  <SunnyForm
    :schema="schema"
    :common-config="{ disabled: true }"
  />
</template>
```

**Hook 模式：**

```vue
<script setup lang="ts">
import { useSunnyForm } from '@sunny-base-web/ui';

// ✅ 在 useSunnyForm 中配置表单级禁用
const [Form, formApi] = useSunnyForm({
  schema: [
    { fieldName: 'name', label: '姓名', component: 'Input' },
    { fieldName: 'status', label: '状态', component: 'Select' },
  ],
  commonConfig: {
    disabled: true,  // ✅ 表单级禁用：所有字段不可编辑
  },
});
</script>

<template>
  <Form />
</template>
```

**动态控制：**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSunnyForm } from '@sunny-base-web/ui';

const isDetailPage = ref(true);

const [Form, formApi] = useSunnyForm({
  schema: [...],
  commonConfig: computed(() => ({
    disabled: isDetailPage.value,  // ✅ 响应式控制
  })),
});

// 动态切换编辑/只读模式
const toggleEditMode = () => {
  isDetailPage.value = !isDetailPage.value;
};
</script>
```

**适用场景：**
- ✅ 详情页面（只读查看）
- ✅ 审批页面（禁止编辑）
- ✅ 历史记录（不可修改）

#### 3. 部分字段可编辑

在表单级禁用的基础上，允许特定字段编辑：

```typescript
const schema = [
  {
    fieldName: 'name',
    label: '姓名',
    disabled: false,  // ✅ 覆盖表单级禁用，允许编辑
  },
  {
    fieldName: 'status',
    label: '状态',
    // 继承表单级禁用，不可编辑
  },
];
```

**适用场景：**
- ✅ 审批表单（部分字段可修改）
- ✅ 订单详情（可修改备注，其他不可编辑）
- ✅ 配置页面（核心配置只读，其他可编辑）

#### 4. 动态联动禁用（最高优先级）

根据其他字段的值动态控制禁用状态：

```typescript
const schema = [
  {
    fieldName: 'type',
    label: '类型',
  },
  {
    fieldName: 'reason',
    label: '原因',
    dependencies: {
      // ✅ dependencies 优先级最高，覆盖所有层级
      disabled: (values) => values.type !== 'other',
    }
  },
];
```

**适用场景：**
- ✅ 条件性字段（选择"其他"时才可填写原因）
- ✅ 联动控制（选择特定选项后启用相关字段）
- ✅ 复杂业务逻辑（根据表单状态动态控制）

### 完整示例

#### 场景：审批表单

**组件模式：**

```vue
<template>
  <div class="approval-form">
    <h2>采购审批单</h2>

    <!-- ✅ 表单级禁用：审批人只能修改审批意见 -->
    <SunnyForm
      :schema="schema"
      :common-config="commonConfig"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@sunny-base-web/stores';

const authStore = useAuthStore();

// Schema 配置
const schema = [
  {
    fieldName: 'purchaseNo',
    label: '采购单号',
    component: 'Input',
    // 继承表单级禁用：不可编辑
  },
  {
    fieldName: 'applicant',
    label: '申请人',
    component: 'Input',
    // 继承表单级禁用：不可编辑
  },
  {
    fieldName: 'amount',
    label: '金额',
    component: 'InputNumber',
    // 继承表单级禁用：不可编辑
  },
  {
    fieldName: 'approvalComment',
    label: '审批意见',
    component: 'Textarea',
    disabled: false,  // ✅ 覆盖表单级禁用：审批人可编辑
  },
  {
    fieldName: 'rejectionReason',
    label: '拒绝原因',
    component: 'Textarea',
    dependencies: {
      // ✅ 动态联动：只有选择"拒绝"时才启用
      disabled: (values) => values.approvalStatus !== 'rejected',
    }
  },
];

// 根据角色动态配置
const commonConfig = computed(() => {
  return {
    disabled: !authStore.canApprove,  // 非审批人：所有字段禁用
  };
});

const handleSubmit = (values: any) => {
  console.log('提交审批：', values);
};
</script>
```

**Hook 模式（推荐）：**

```vue
<template>
  <div class="approval-form">
    <h2>采购审批单</h2>

    <!-- ✅ 表单级禁用：审批人只能修改审批意见 -->
    <Form />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSunnyForm } from '@sunny-base-web/ui';
import { useAuthStore } from '@sunny-base-web/stores';

const authStore = useAuthStore();

// ✅ 使用 Hook 创建表单
const [Form, formApi] = useSunnyForm({
  schema: [
    {
      fieldName: 'purchaseNo',
      label: '采购单号',
      component: 'Input',
      // 继承表单级禁用：不可编辑
    },
    {
      fieldName: 'applicant',
      label: '申请人',
      component: 'Input',
      // 继承表单级禁用：不可编辑
    },
    {
      fieldName: 'amount',
      label: '金额',
      component: 'InputNumber',
      // 继承表单级禁用：不可编辑
    },
    {
      fieldName: 'approvalComment',
      label: '审批意见',
      component: 'Textarea',
      disabled: false,  // ✅ 覆盖表单级禁用：审批人可编辑
    },
    {
      fieldName: 'rejectionReason',
      label: '拒绝原因',
      component: 'Textarea',
      dependencies: {
        // ✅ 动态联动：只有选择"拒绝"时才启用
        disabled: (values) => values.approvalStatus !== 'rejected',
      }
    },
  ],
  // ✅ 根据角色动态配置
  commonConfig: computed(() => ({
    disabled: !authStore.canApprove,  // 非审批人：所有字段禁用
  })),
  handleSubmit: (values) => {
    console.log('提交审批：', values);
  },
});
</script>
```

**动态控制禁用状态：**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSunnyForm } from '@sunny-base-web/ui';

const editMode = ref(false);

const [Form, formApi] = useSunnyForm({
  schema: [...],
  commonConfig: computed(() => ({
    disabled: !editMode.value,  // ✅ 根据编辑模式动态切换
  })),
});

// 切换编辑模式
const toggleEditMode = () => {
  editMode.value = !editMode.value;
};
</script>

<template>
  <div>
    <a-button @click="toggleEditMode">
      {{ editMode ? '取消编辑' : '编辑' }}
    </a-button>
    <Form />
  </div>
</template>
```

### 最佳实践

#### ✅ 推荐用法

```typescript
// ✅ 推荐：使用全局禁用控制应用级权限
// apps/web/src/bootstrap.ts
setupBusinessForm({
  config: {
    disabled: authStore.isReadOnly,
  }
});

// ✅ 推荐：使用表单级禁用控制页面状态（组件模式）
<SunnyForm :common-config="{ disabled: isDetailPage }" />

// ✅ 推荐：使用表单级禁用控制页面状态（Hook 模式）
const [Form] = useSunnyForm({
  schema: [...],
  commonConfig: computed(() => ({
    disabled: isDetailPage.value,
  })),
});

// ✅ 推荐：使用 Schema 禁用控制特定字段
{
  fieldName: 'createdAt',
  disabled: true,  // 创建时间永远不可编辑
}

// ✅ 推荐：使用 dependencies 实现动态联动
{
  fieldName: 'endDate',
  dependencies: {
    disabled: (values) => !values.startDate,
  }
}

// ✅ 推荐：结合 formApi 动态更新禁用状态
const [Form, formApi] = useSunnyForm({
  schema: [...],
  commonConfig: { disabled: true },
});

// 切换到编辑模式
const enableEditMode = () => {
  formApi.setState({
    commonConfig: { disabled: false },
  });
};
```
<SunnyForm :common-config="{ disabled: isDetailPage }" />

// ✅ 推荐：使用 Schema 禁用控制特定字段
{
  fieldName: 'createdAt',
  disabled: true,  // 创建时间永远不可编辑
}

// ✅ 推荐：使用 dependencies 实现动态联动
{
  fieldName: 'endDate',
  dependencies: {
    disabled: (values) => !values.startDate,
  }
}
```

#### ❌ 避免用法

```typescript
// ❌ 避免：同时配置多个层级导致混淆
{
  disabled: true,  // Schema 禁用
  componentProps: {
    disabled: false,  // Props 禁用
  },
  dependencies: {
    disabled: () => false,  // 依赖禁用
  }
}
```

### 向后兼容性

- ✅ **完全兼容**：所有现有代码无需修改
- ✅ **默认行为不变**：`disabled` 默认为 `false`
- ✅ **字段级配置依然有效**：现有的 `schema.disabled` 继续工作

### 性能考虑

- ✅ 使用 `computed` 缓存计算结果
- ✅ 短路求值优化（遇到 `true` 立即返回）
- ✅ 不影响现有表单性能

## API 参考

#### 基础配置 (Basic)

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `schema` | `FormSchema[]` | `[]` | 表单字段定义配置。 |
| `values` | `Record<string, any>` | - | 表单初始值 (v-model)。 |
| `layout` | `'horizontal' \| 'vertical' \| 'inline'` | `'horizontal'` | 表单布局方式。 |
| `compact` | `boolean` | `false` | 是否开启紧凑模式 (减小间距)。 |


#### Schema 配置详解 (FormSchema)

`schema` 数组中每一项的配置对象。

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `fieldName` | `string` | **(必填)** 字段名，对应表单值的 Key。 |
| `component` | `string \| Component` | **(必填)** 组件类型。支持内置组件 (`'Input'`, `'Select'`, `'Slot'` 等) 或自定义组件对象。`'Slot'` 表示使用字段插槽渲染。 |
| `label` | `string` | 字段标签文本。 |
| `defaultValue` | `any` | 字段默认值。 |
| `hidden` | `boolean` | 是否隐藏字段（静态隐藏，不参与联动逻辑）。 |
| `componentProps` | `Record<string, any> \| Function` | 传递给组件的属性 (支持动态函数)。 |
| `rules` | `string \| ZodType` | 验证规则 (如 `'required'` 或 Zod Schema)。 |
| `help` | `string` | 帮助提示信息 (显示在输入框下方)。 |
| `labelWidth` | `number \| string` | 覆盖全局的标签宽度。 |
| `colProps` | `ColProps` | 覆盖全局的栅格配置 (如 `{ span: 12 }`)。 |
| `colSpan` | `number` | 简化的栅格跨度设置 (1-24)。 |
| `dependencies` | `FormItemDependencies` | 字段联动配置 (if, show, componentProps 等)。 |
| `commonComponentProps` | `Record<string, any>` | 通用组件属性 (优先级低于 componentProps)。 |
| `formFieldProps` | `Record<string, any>` | 传递给 `a-form-item` 的属性。 |

#### 通用配置 (Common Config)

配置在 `commonConfig` 对象中的属性，将作为全局默认值应用到表单项或表单行为中。

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `colProps` | `ColProps` | - | 默认的响应式栅格配置。 |
| `labelWidth` | `number \| string` | - | 默认标签宽度。 |
| `disabledOnChangeListener` | `boolean` | `false` | 是否禁用全局 change 事件监听 (如不需要联动逻辑可开启以提升性能)。 |
| `disabledOnInputListener` | `boolean` | `false` | 是否禁用全局 input 事件监听。 |
| `emptyStateValue` | `any` | `undefined` | 字段值为空时的占位值 (如 `-` 或 `N/A`)。 |

### 演示效果

<preview path="./demos/form/CommonConfig.vue" title="通用配置演示" description="演示事件监听的开启与禁用 (disabledOnChangeListener)，对比性能优化场景下的行为差异。" />

#### 布局与样式 (Layout & Style)

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `commonConfig` | `Record<string, any>` | - | 表单项通用配置，如 `colProps` (响应式栅格)、`labelWidth` 等。 |
| `gridProps` | `Record<string, any>` | - | 栅格容器配置 (传递给 a-grid)，如 `cols`, `xGap`, `yGap`。 |
| `labelWidth` | `number \| string` | - | 全局标签宽度。 |
| `wrapperClass` | `string` | - | 表单外层容器类名。 |

#### 操作栏与按钮 (Actions)

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `showDefaultActions` | `boolean` | `true` | 是否显示默认操作按钮 (提交/重置)。设为 `false` 可隐藏整个操作栏。 |
| `actionColProps` | `ColProps` | - | 操作栏的栅格配置。默认继承 `commonConfig.colProps` 或使用响应式默认值。 |
| `actionLayout` | `'inline' \| 'newLine' \| 'rowEnd'` | `'inline'` | 操作按钮布局模式。 |
| `actionPosition` | `'left' \| 'right' \| 'center'` | `'right'` | 操作按钮对齐位置。 |
| `submitButtonOptions` | `ActionButtonOptions` | - | 提交按钮配置，支持 Arco Button Props + `show` 属性控制显示。 |
| `resetButtonOptions` | `ActionButtonOptions` | - | 重置按钮配置，支持 Arco Button Props + `show` 属性控制显示。 |

**ActionButtonOptions 扩展属性：**

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `show` | `boolean` | `true` | 是否显示该按钮。 |
| `content` | `string` | `'查询'` / `'重置'` | 按钮文本内容。 |
| `...props` | `ButtonProps` | - | 其他 Arco Button 属性 (如 `type`, `status`, `disabled` 等)。 |
| `actionWrapperClass` | `string` | - | 操作栏外层容器类名。 |

#### 折叠功能 (Collapse)

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `showCollapseButton` | `boolean` | `false` | 是否启用折叠功能及显示切换按钮。 |
| `collapsed` | `boolean` | `false` | 当前的折叠状态 (支持 v-model)。 |
| `collapsedRows` | `number` | `1` | 折叠时保留的行数。 |
| `collapseTriggerResize` | `boolean` | `false` | 切换时是否触发布局重算 (window.resize)。 |

#### 交互与事件 (Interaction & Events)

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `submitOnEnter` | `boolean` | `false` | 是否回车触发提交。 |
| `submitOnChange` | `boolean` | `false` | 是否在字段值变化时自动提交。 |
| `scrollToFirstError` | `boolean` | `false` | 校验失败时是否自动滚动到第一个错误字段。 |
| `handleValuesChange` | `(values, changedFields) => void` | - | 字段值变化时的回调。 |
| `handleCollapsedChange` | `(collapsed: boolean) => void` | - | 折叠状态变化时的回调。 |
| `handleSubmit` | `(values) => Promise<void> \| void` | - | 表单提交回调。 |
| `handleReset` | `(values) => Promise<void> \| void` | - | 表单重置回调。 |

#### 数据处理 (Data Processing)

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fieldMappingTime` | `FieldMappingTime` | - | 表单字段映射到时间格式。配置规则详见 [数据转换](#数据转换-data-transformation)。 |
| `arrayToStringFields` | `ArrayToStringFields` | - | 数组转字符串字段配置。配置规则详见 [数据转换](#数据转换-data-transformation)。 |

## FormApi 方法 (FormApi Methods)

通过 `useSunnyForm` 返回的 `formApi` 对象，您可以对表单进行全方位的控制。

<preview path="./demos/form/FormApi.vue" />

### 状态与值管理

| 方法名 | 类型 | 说明 |
| --- | --- | --- |
| `getValues` | `() => Promise<Record<string, any>>` | 获取表单当前值 (已处理日期格式等)。 |
| `setValues` | `(fields: Record<string, any>, filter?: boolean, validate?: boolean) => Promise<void>` | 批量设置表单值。默认会自动过滤掉 Schema 中不存在的字段。支持嵌套路径 (如 `{ 'user.name': 'John' }`)。 |
| `setFieldValue` | `(field: string, value: any, validate?: boolean) => Promise<void>` | 设置单个字段的值。支持嵌套路径 (如 `'user.profile.name'`, `'items[0].id'`)。 |
| `getState` | `() => SunnyFormProps` | 获取表单当前的完整状态配置。 |
| `setState` | `(state: Partial<SunnyFormProps> \| ((prev) => Partial<SunnyFormProps>)) => void` | 更新表单状态 (如 loading, schema 等)。 |
| `getLatestSubmissionValues` | `() => Record<string, any>` | 获取最后一次提交时的表单值。 |

#### setValues 参数详解

```typescript
await formApi.setValues(fields, filter?, validate?)
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fields` | `Record<string, any>` | - | 要设置的值对象 |
| `filter` | `boolean` | `true` | 是否过滤非 Schema 字段 |
| `validate` | `boolean` | `false` | 是否触发校验 |

**使用示例：**

```typescript
// 默认行为：过滤非 Schema 字段（推荐）
// 后端返回的数据可能包含额外字段，默认会过滤掉
const backendData = { name: 'John', age: 25, factory: 'ABC' };
await formApi.setValues(backendData);
// 结果：只有 schema 中定义的字段会被设置，factory 会被过滤

// 不过滤：保留所有字段（包括非 Schema 字段）
await formApi.setValues(backendData, false);
// 结果：name, age, factory 都会被设置

// 单独设置非 Schema 字段
await formApi.setFieldValue('factory', 'ABC');
```

> ⚠️ **注意**：如果设置非 Schema 字段后需要获取，`getValues()` 会返回所有字段值（包括非 Schema 字段）。

#### 嵌套路径支持

`setValues` 和 `setFieldValue` 支持嵌套路径语法，可以方便地设置深层对象的值：

```typescript
// 对象嵌套路径 (使用点号 .)
await formApi.setFieldValue('user.profile.name', 'John');
// 结果: { user: { profile: { name: 'John' } } }

// 数组索引路径 (使用方括号 [])
await formApi.setFieldValue('items[0].id', 1);
await formApi.setFieldValue('items[0].name', 'Item 1');
// 结果: { items: [{ id: 1, name: 'Item 1' }] }

// setValues 批量设置嵌套路径
await formApi.setValues({
  'user.name': 'John',
  'user.email': 'john@example.com',
  'items[0].id': 1,
});
```

**支持的路径格式：**
- `'a.b.c'` - 对象嵌套
- `'a[0]'` - 数组索引
- `'a[0].b.c'` - 混合嵌套
- `'a.b[0].c'` - 混合嵌套

### 校验与提交

| 方法名 | 类型 | 说明 |
| --- | --- | --- |
| `validate` | `() => Promise<ValidationResult>` | 触发全表单校验。 |
| `validateField` | `(fieldName: string) => Promise<ValidationResult>` | 校验指定字段。 |
| `submitForm` | `() => Promise<void>` | 触发提交操作 (会执行 handleSubmit)。 |
| `validateAndSubmitForm` | `() => Promise<void>` | 先校验，通过后再提交。 |
| `resetForm` | `() => Promise<void>` | 重置表单值和状态到初始状态。 |
| `resetValidate` | `() => Promise<void>` | 清除所有校验错误信息。 |
| `scrollToFirstError` | `(errors?: Record<string, any>) => void` | 滚动到第一个校验错误的字段。 |

### Schema 动态操作

| 方法名 | 类型 | 说明 |
| --- | --- | --- |
| `updateSchema` | `(schema: Partial<FormSchema>[]) => void` | 动态更新 Schema (如修改 label, rules, props 等)。需包含 `fieldName` 以定位字段。 |
| `removeSchemaByFields` | `(fields: string[]) => Promise<void>` | 根据字段名动态移除表单项。 |

### 组件与实例

| 方法名 | 类型 | 说明 |
| --- | --- | --- |
| `getFieldComponentRef` | `(fieldName: string) => ComponentPublicInstance \| undefined` | 获取指定字段的 Vue 组件实例 (可用于调用 focus, select 等方法)。 |
| `getFocusedField` | `() => string \| undefined` | 获取当前获得焦点的字段名。 |

### 高级特性

| 方法名 | 类型 | 说明 |
| --- | --- | --- |
| `merge` | `(formApi: FormApi) => Proxy` | 合并多个 FormApi 实例，支持链式调用，用于多表单联合提交。 |