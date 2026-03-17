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

<preview path="./demos/form/Basic.vue" title="Hook 模式" description="使用 useSunnyForm 创建表单，通过 formApi 控制表单行为。" />

### 组件模式

直接使用 `<SunnyForm />` 组件。

**适用场景：**
- 简单的展示型表单。
- 不需要复杂的外部控制逻辑。
- 只需要通过 Props 传递配置，利用事件 (`@submit`, `@reset`) 处理结果。

<!-- <preview path="./demos/form/ComponentUsage.vue" title="组件模式" description="直接使用 SunnyForm 组件，通过 Props 传递配置。" /> -->

## 表单验证

Sunny Form 提供了统一的验证机制，通过 `rules` 属性同时管理**逻辑校验**、**输入过滤**和**格式提示**。

<preview path="./demos/form/Validation.vue" title="验证规则示例" description="演示必填、格式校验、自定义校验函数以及组合校验。" />

### 验证配置方式

Sunny Form 推荐使用 `rules` 属性进行统一配置，系统会自动根据规则推断输入行为：

#### 1. 统一配置 (`rules`)
通过 `rules` 属性配置所有校验规则，支持管道符 `|` 分隔或对象格式。

- **配置位置**: Schema 中的 `rules` 属性
- **功能**:
  - **逻辑校验**: 必填 (`required`)、格式校验 (`phone`, `email` 等)。
  - **输入控制**: 自动识别规则（如 `phone`），启用输入过滤（例如只能输数字）。
  - **输入提示**: 自动识别规则，在输入框右侧显示对应的提示图标。

```ts
{
  label: '手机号',
  component: 'Input',
  componentProps: {
    placeholder: '请输入手机号',
  },
  // 统一配置：
  // 1. 启用必填校验
  // 2. 启用手机号格式校验
  // 3. 自动启用手机号输入过滤（只能输数字）
  // 4. 自动显示手机号提示图标
  rules: 'required|phone' 
}
```

#### 2. 对象式配置
也可以使用对象格式进行配置：

```ts
{
  label: '用户名',
  component: 'Input',
  rules: {
    required: true,
    email: true
  }
}
```

### 内置规则说明

系统内置了多种常用规则，可以直接在 `rules` 中使用。所有 `@sunny-base-web/utils` 中定义的正则模式都会自动注册为验证规则。

> 💡 **相关文档**：
> - 查看完整的内置正则规则列表，请参考 [Regex 正则表达式](/utilities/regex.html)

| 规则名称 | 说明 | 附加效果 (仅 Input 组件) |
| :--- | :--- | :--- |
| `required` | 必填校验，为空时阻断提交 | 无 |
| `phone` | 手机号格式校验 | 限制仅输入数字，显示手机图标 |
| `email` | 邮箱格式校验 | 显示邮箱图标 |
| `idCard` | 身份证格式校验 | 限制输入格式，显示身份证图标 |
| `password` | 密码格式校验 | 显示密码强度提示图标 |
| `min:length` | 最小长度校验 | 无 |
| `max:length` | 最大长度校验 | 无 |

## 高级用法

支持 Grid 布局、Label 宽度统一设置、通用配置以及字段联动等高级特性。

### 布局配置

<preview path="./demos/form/Layout.vue" title="布局与全局配置" description="演示实时布局调整、列数变化、标签宽度、全局配置以及紧凑模式、折叠操作等更多 Props 配置。" />

可以通过 `layout` 属性配置表单布局：

- **layout**: 布局模式，可选值：
  - `'horizontal'` (默认): 水平布局，通常配合 Grid 使用。
  - `'vertical'`: 垂直布局，标签位于控件上方。
  - `'inline'`: 行内布局，控件排列在一行。

- **wrapperClass**: 容器类名，用于控制 Grid 列数。
  - 默认值：`grid-cols-1 sm:grid-cols-2 md:grid-cols-3` (响应式布局)。
  - 自定义示例：`grid-cols-2` (固定两列)、`grid-cols-1 md:grid-cols-2 lg:grid-cols-4` (自定义响应式)。

- **colSpan**: 字段跨度 (1-24)。在 Schema 中配置，控制单个字段占用的列数。

```typescript
const [Form] = useSunnyForm({
  layout: 'horizontal',
  // 自定义 Grid 布局：大屏 3 列，中屏 2 列，小屏 1 列
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  schema: [
    {
      label: '字段 A',
      fieldName: 'fieldA',
      component: 'Input',
      colSpan: 1, // 占 1 列
    },
    {
      label: '字段 B',
      fieldName: 'fieldB',
      component: 'Input',
      colSpan: 2, // 占 2 列
    },
  ],
});
```

### 全局配置

支持通过 `labelWidth` 和 `commonConfig` 属性对表单进行全局统一配置，减少重复代码。

- **labelWidth**: `number | string`
  - 统一设置所有字段的标签宽度（像素）。
  - 单个字段可以在 schema 中通过 `labelWidth` 覆盖全局设置。

- **commonConfig**: `Record<string, any>`
  - 定义通用的 schema 属性，会自动合并到每个字段的 schema 中。
  - 常用于统一设置 `disabled`, `labelAlign`, `labelCol` 等属性。
  - 优先级：字段 schema > commonConfig > 默认值。

```typescript
// 示例：全局禁用所有字段，并统一标签宽度
<Form 
  :labelWidth="120"
  :commonConfig="{ disabled: true }"
/>
```

### 字段联动 (Dependencies)

支持通过 `dependencies` 配置项实现字段间的联动逻辑（如控制显隐、禁用、动态属性等）。

<!-- <preview path="./demos/form/SchemaDemo.vue" title="Schema 高级特性" description="演示字段联动、动态显隐、动态必填、帮助信息等高级 Schema 配置。" /> -->

**配置项 (`dependencies`)**

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `triggerFields` | `string[]` | 触发联动的依赖字段名数组。 |
| `if` | `(values, formApi) => boolean` | 控制字段是否渲染 (v-if)。如果不渲染，字段值会被忽略。 |
| `show` | `(values, formApi) => boolean` | 控制字段是否显示 (v-show)。隐藏时字段仍存在于 DOM 中。 |
| `disabled` | `(values, formApi) => boolean` | 动态控制字段的禁用状态。 |
| `required` | `(values, formApi) => boolean` | 动态控制字段是否必填。 |
| `rules` | `(values, formApi) => Rules` | 动态改变验证规则。 |
| `componentProps` | `(values, formApi) => Props` | 动态计算组件的 Props。 |

```typescript
{
  label: '邮箱',
  fieldName: 'email',
  component: 'Input',
  // 联动：只有当 enableNotification 为 true 时显示
  dependencies: {
    triggerFields: ['enableNotification'],
    if(values) {
      return !!values.enableNotification;
    }
  }
}
```

## API 参考

### Form Props

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `schema` | `FormSchema[]` | `[]` | 表单字段配置数组。 |
| `layout` | `'horizontal' \| 'vertical' \| 'inline'` | `'horizontal'` | 表单布局模式。 |
| `labelWidth` | `number \| string` | - | 全局标签宽度。 |
| `wrapperClass` | `string` | `grid-cols-1 ...` | 表单网格容器类名，用于控制响应式列数。 |
| `commonConfig` | `object` | - | 通用 Schema 配置，会自动合并到每个字段。 |
| `compact` | `boolean` | `false` | 是否开启紧凑模式（减少间距）。 |
| `submitOnEnter` | `boolean` | `false` | 是否在按下回车键时提交表单。 |
| `submitOnChange` | `boolean` | `false` | 是否在值变化时自动提交表单。 |
| `showDefaultActions` | `boolean` | `true` | 是否显示默认的操作按钮（提交/重置）。 |
| `actionWrapperClass` | `string` | - | 操作栏外层类名。 |
| `submitButtonOptions` | `object` | - | 提交按钮配置 (Arco Button Props)。 |
| `resetButtonOptions` | `object` | - | 重置按钮配置 (Arco Button Props)。 |
| `collapsed` | `boolean` | `false` | 是否处于折叠状态。 |
| `showCollapseButton` | `boolean` | `false` | 是否显示折叠/展开按钮。 |
| `alwaysShowLines` | `number` | `1` | 折叠状态下始终显示的行数。 |
| `collapsedRows` | `number` | `1` | `alwaysShowLines` 的别名。 |
| `collapseTriggerResize` | `boolean` | `false` | 折叠/展开时是否触发布局 resize 事件。 |
| `scrollToFirstError` | `boolean` | `false` | 验证失败时是否自动滚动到第一个错误字段。 |
| `fieldMappingTime` | `Array` | - | 字段时间映射配置 `[field, [startTimeKey, endTimeKey], format?]`。 |
| `arrayToStringFields` | `Array` | - | 数组转字符串字段配置，用于自动处理多选等数组值。 |
| `values` | `object` | - | 表单值 (受控模式)，通常由 FormApi 管理。 |
| `handleSubmit` | `(values) => void` | - | 表单提交回调。 |
| `handleReset` | `(values) => void` | - | 表单重置回调。 |
| `handleValuesChange` | `(values, changedFields) => void` | - | 表单值变化回调。 |
| `handleCollapsedChange` | `(collapsed) => void` | - | 折叠状态变化回调。 |

### Form Schema

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `fieldName` | `string` | **必填**。字段名，对应表单值的 key。 |
| `component` | `string \| Component` | **必填**。渲染的组件，如 `'Input'`, `'Select'`。 |
| `label` | `string` | 字段标签文本。 |
| `defaultValue` | `any` | 字段默认值。 |
| `componentProps` | `object` | 传递给组件的 Props。 |
| `rules` | `string \| object` | 验证规则。 |
| `help` | `string` | 帮助提示信息，显示在输入框下方。 |
| `colSpan` | `number` | 占据的栅格列数 (1-24)，默认 1。 |
| `disabled` | `boolean` | 是否禁用该字段。 |
| `hidden` | `boolean` | 是否隐藏该字段 (等同于 v-if=false)。 |
| `dependencies` | `object` | 字段联动配置。 |

### Form API

通过 `useSunnyForm` 返回的 `api` 对象，可以对表单进行精细控制。

<preview path="./demos/form/FormApi.vue" title="API 操作示例" description="演示获取值、设置值、重置、验证以及使用 useStore 订阅状态。" />

| 方法 | 说明 |
| :--- | :--- |
| `submit()` | 触发表单验证并提交。 |
| `reset()` | 重置表单到初始状态。 |
| `validate()` | 触发表单验证。 |
| `getValues()` | 获取当前表单的所有值。 |
| `setValues(values)` | 设置表单值（增量合并）。 |
| `setFieldValue(field, value)` | 设置单个字段的值。 |
| `useStore(selector)` | **Hook**。在组件中订阅表单状态变化（响应式）。 |
| `updateSchema(schema)` | 更新表单 Schema 配置。 |
| `setProps(props)` | 动态更新表单 Props。 |

```typescript
const [Register, { submit, reset, setValues, useStore }] = useSunnyForm();

// 订阅状态
const values = useStore((state) => state.values);

// 手动操作
const handleCustomAction = async () => {
  await setValues({ name: 'New Name' });
  await submit();
};
```
