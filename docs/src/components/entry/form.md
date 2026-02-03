# Form 表单

基于 Arco Design 的 Form 组件封装，提供了 schema 驱动的表单生成能力，简化了复杂表单的开发。

## 使用模式

Form 组件支持两种使用模式：**Hook 模式** 和 **组件模式**。

### Hook 模式 (推荐)

使用 `useKunkkaForm` 创建表单。

**适用场景：**
- 需要在外部通过 API (如 `formApi`) 灵活控制表单（提交、重置、设置值、校验等）。
- 复杂表单，需要处理联动、动态更新 Schema 等逻辑。
- 习惯 React Hook 风格或希望逻辑与 UI 分离。


## 基础用法 (Basic)

最简单的表单使用方式，包含基础布局和字段配置。

<preview path="./demos/form/Basic.vue" title="基础用法" description="包含文本框、下拉框等基础组件，展示默认布局效果。" />

## 布局与样式 (Layout & Style)

KunkkaForm 基于 Arco Design 的 24 栅格系统，支持强大的响应式布局能力。

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
  - 为了避免全局污染，推荐使用 `setupKunkkaForm` 在组件级按需注入规则。
  - 支持直接注入 `@sunny-base-web/utils` 中的常用正则模式。

### 常用正则规则

`@sunny-base-web/utils/regex` 提供了丰富的常用正则模式 (如 `phone`, `email`, `idCard` 等)。

你可以通过 `setupKunkkaForm` 将这些模式批量注册为字符串规则，从而在 Schema 中便捷使用。

> 💡 **相关文档**：
> - 查看完整的内置正则规则列表，请参考 [Regex 正则表达式](/utilities/regex.html)

## 交互与事件 (Interaction & Events)

支持回车提交、值变更监听等丰富的交互能力。

<preview path="./demos/form/Interaction.vue" title="交互演示" description="尝试在输入框回车，或改变下拉框的值，观察自动提交和事件回调。" />

## 数据转换 (Data Transformation)

KunkkaForm 提供了内置的数据转换机制，方便在表单值（通常是数组或复杂对象）与后端接口字段（通常是扁平化字段）之间进行自动映射。

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
| `component` | `string \| Component` | **(必填)** 组件类型 (如 `'Input'`, `'Select'`) 或组件对象。 |
| `label` | `string` | 字段标签文本。 |
| `defaultValue` | `any` | 字段默认值。 |
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
| `showDefaultActions` | `boolean` | `true` | 是否显示默认操作按钮 (提交/重置)。 |
| `actionColProps` | `ColProps` | - | 操作栏的栅格配置。默认继承 `commonConfig.colProps` 或使用响应式默认值。 |
| `actionLayout` | `'inline' \| 'newLine' \| 'rowEnd'` | `'inline'` | 操作按钮布局模式。 |
| `actionPosition` | `'left' \| 'right' \| 'center'` | `'right'` | 操作按钮对齐位置。 |
| `submitButtonOptions` | `ButtonProps` | - | 提交按钮配置 (Arco Button Props)。 |
| `resetButtonOptions` | `ButtonProps` | - | 重置按钮配置 (Arco Button Props)。 |
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

通过 `useKunkkaForm` 返回的 `formApi` 对象，您可以对表单进行全方位的控制。

<preview path="./demos/form/FormApi.vue" />

### 状态与值管理

| 方法名 | 类型 | 说明 |
| --- | --- | --- |
| `getValues` | `() => Promise<Record<string, any>>` | 获取表单当前值 (已处理日期格式等)。 |
| `setValues` | `(fields: Record<string, any>, filter?: boolean, validate?: boolean) => Promise<void>` | 批量设置表单值。默认会自动过滤掉 Schema 中不存在的字段。 |
| `setFieldValue` | `(field: string, value: any, validate?: boolean) => Promise<void>` | 设置单个字段的值。 |
| `getState` | `() => KunkkaFormProps` | 获取表单当前的完整状态配置。 |
| `setState` | `(state: Partial<KunkkaFormProps> \| ((prev) => Partial<KunkkaFormProps>)) => void` | 更新表单状态 (如 loading, schema 等)。 |
| `getLatestSubmissionValues` | `() => Record<string, any>` | 获取最后一次提交时的表单值。 |

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

