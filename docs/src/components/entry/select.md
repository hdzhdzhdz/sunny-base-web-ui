# Select 上下文关联选择器

基于 Arco Design Select，增加了基于上下文 (`filterModel`) 动态过滤选项的能力。适用于**选项需要根据表单上下文（如当前公司、角色等）进行个性化显示/隐藏**的场景。

## 功能特性

- **上下文过滤**：根据 `filterModel` 和选项的 `cMeta` 自动控制选项的显示/隐藏。
- **自动清理 (Auto Clear)**：当上下文变化导致当前选中的值不再可见时，组件会自动清空选中值（或在多选模式下移除失效值），确保数据的一致性。
- **完全兼容**：支持 Arco Select 的所有原生 Props 和插槽（包括自定义 Option 插槽）。

## 动态过滤演示

<preview path="./demos/select/ContextFilter.vue" title="上下文过滤" description="修改表单上下文，观察选项的动态显示与隐藏。注意观察：当上下文变化导致当前选中项失效时，值会自动清空。" />

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 绑定值 | `string \| number \| ...` | - |
| options | 选项列表，支持 `cMeta` 属性配置过滤条件 | `SelectOption[]` | `[]` |
| filterModel | 过滤上下文模型（通常绑定当前表单对象） | `Record<string, any>` | - |

### SelectOption with cMeta

```typescript
interface SelectOption {
  label: string;
  value: string | number;
  // ...其他标准属性
  
  /**
   * 上下文元数据限制
   * 只有当 filterModel 中的值与此处定义的值完全匹配时，该选项才显示
   */
  cMeta?: Record<string, any>; 
}
```

**示例配置：**

```javascript
const options = [
  // 始终显示
  { label: '通用', value: 1 }, 
  
  // 仅当 filterModel.company === 100 时显示
  { label: '公司100', value: 2, cMeta: { company: 100 } },
  
  // 仅当 filterModel.company === 100 且 filterModel.role === 'admin' 时显示
  { label: '公司100管理员', value: 3, cMeta: { company: 100, role: 'admin' } }
];
```

### 注意事项

1. **弱类型匹配**：`cMeta` 中的值匹配采用弱类型比较 (`==`)，因此字符串 `'1400'` 和数字 `1400` 会被视为匹配。
2. **allow-create 例外**：如果开启了 `allow-create` 属性，自动清理逻辑将被禁用，因为用户可能输入了不在选项列表中的自定义值。

