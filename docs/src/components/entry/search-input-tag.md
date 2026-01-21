# SearchInputTag 公共查询

基于 Arco Design 的 InputTag 组件封装，专用于"只读展示 + 外部选择"的场景。

## 主要特性

- **只读模式**：禁止用户手动输入，只能通过删除键或点击关闭按钮移除，保证数据规范性。
- **对象模型**：支持直接绑定对象数组，无需手动转换数据格式。
- **灵活映射**：通过 `fieldNames` 自定义标签文本和值的字段名，适配后端不同的数据结构。
- **外部触发**：内置搜索按钮，点击触发 `search` 事件，方便集成弹窗选择器。

## 基础用法

<preview path="./demos/search-input-tag/BasicUsage.vue" title="基础用法" description="演示对象数组绑定和搜索事件触发" />

## 数据字段映射 (fieldNames)

在实际业务中，后端返回的对象数组字段名可能各不相同（例如 `id`/`name`，`key`/`title` 等）。
通过 `fieldNames` 属性，你可以指定哪个字段作为标签显示的文本（label），哪个字段作为唯一标识（value）。

<preview path="./demos/search-input-tag/CustomFieldNames.vue" title="自定义字段映射" description="动态修改 fieldNames 配置，适配任意数据结构" />

默认配置为 `{ label: 'label', value: 'value' }`。

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 绑定值，必须是对象数组 | `any[]` | `[]` |
| fieldNames | 字段映射配置，用于指定显示文本和值的字段名 | `FieldNames` | `{ label: 'label', value: 'value' }` |
| placeholder | 输入框占位符 | `string` | `'请选择...'` |
| disabled | 是否禁用 | `boolean` | `false` |
| maxTagCount | 最多显示标签数量，超出后显示 `+N` | `number` | `-` |

### FieldNames 类型定义

```typescript
interface FieldNames {
  label?: string; // 指定标签显示的字段名
  value?: string; // 指定值的字段名
}
```

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 值变化时触发（v-model 更新） | `value: any[]` |
| change | 值变化时触发 | `value: any[]` |
| search | 点击输入框右侧搜索按钮时触发 | - |
| clear | 点击清空按钮时触发 | - |
