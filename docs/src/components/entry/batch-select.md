# BatchSelect 批量选择器

基于 Arco Design 的 Select 组件封装，增强了批量操作体验。

## 主要特性

- **全选/反选**：一键操作所有选项。
- **批量粘贴**：支持从 Excel 或文本编辑器复制多行数据，直接粘贴到搜索框进行匹配选中。
- **灵活匹配**：支持按 Label、Value 或两者混合匹配粘贴内容。
- **UI 增强**：集成了清除按钮和操作提示。

## 基础用法

<preview path="./demos/select/BasicUsage.vue" title="基础用法" description="包含全选、清除、批量粘贴功能" />

## 匹配策略

支持通过 `matchStrategy` 属性配置粘贴时的匹配逻辑。

- `both` (默认): 同时尝试匹配 Label 和 Value，任一匹配成功即选中。
- `label`: 仅匹配选项的 Label。
- `value`: 仅匹配选项的 Value。

<preview path="./demos/select/MatchStrategy.vue" title="匹配策略演示" description="演示不同匹配模式下的粘贴行为" />

## 上下文过滤与批量操作

BatchSelect 继承了 Select 组件的上下文过滤能力。这意味着：
1. **自动隐藏**：根据 `filterModel` 自动隐藏不符合条件的选项。
2. **操作一致性**：全选、粘贴等批量操作会自动忽略不可见的选项。
3. **自动清理**：当上下文变化导致选项不可见时，已选中的值会被自动剔除。

<preview path="./demos/select/BatchContextFilter.vue" title="上下文批量操作" description="演示上下文变化对批量操作（全选/粘贴/自动清理）的影响" />

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 绑定值 | `(string \| number)[]` | `[]` |
| options | 选项列表 | `SelectOption[]` | `[]` |
| matchStrategy | 粘贴匹配策略 | `'label' \| 'value' \| 'both'` | `'both'` |
| filterModel | 过滤上下文模型 | `Record<string, any>` | - |
| ... | 继承所有 `a-select` 属性 | - | - |

### SelectOption Interface

```typescript
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  [key: string]: any;
}
```

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 选中值变化时触发 | `value: (string \| number)[]` |
| change | 选中值变化时触发 | `value: (string \| number)[]` |
