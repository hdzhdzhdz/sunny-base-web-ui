# CustomizeSelect 自定义配置下拉选择器

基于 Arco Design Select 的二次封装，支持通过后端配置动态生成选项列表的通用业务组件。

## 主要特性

- **配置驱动**：通过 `cNum` 查询编号调用后端接口，动态获取选项列表和组件配置
- **双模式支持**：
  - 普通模式：加载完整的固定选项列表
  - 远程搜索模式：支持输入关键词搜索，内置防抖优化
- **上下文参数**：通过 `attrParam` 传递额外的查询条件，支持选项过滤
- **自定义插槽**：支持在选项右侧显示附加信息（如部门、状态等）

## 基础用法

<preview path="./demos/customize-select/BasicUsage.vue" title="基础用法" description="展示普通模式和远程搜索模式的基本使用" />

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue / value | 绑定值 | `string \| number` | `''` |
| cNum | 查询框编号，用于后端接口调用 | `string \| number` | `''` |
| defaultQuery | 是否默认进行配置查询 | `boolean` | `true` |
| defaultConfig | 默认配置项 | `CustomizeSelectConfig` | `{}` |
| attrParam | 额外的查询参数，会传递给后端接口 | `Record<string, any>` | `{}` |

### CustomizeSelectConfig

```typescript
interface CustomizeSelectConfig {
  nType?: number;          // 模式类型：0-普通选择，1-远程搜索
  cLabelslotcol?: string;  // 插槽字段名，用于显示附加信息
  nSearchinterval?: number; // 搜索防抖间隔（毫秒）
}
```

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 值变化时触发（v-model 更新） | `value: string \| number` |
| selectChange | 选项变化时触发 | `value: string \| number, instance: any` |
| change | 配置了 change 事件监听器时触发 | `{ value, $this }` |

## 后端接口规范

组件会调用接口 `/core/assSelect/commonQuery`（POST 请求），传递以下参数：

```typescript
{
  cNum: string | number;           // 查询框编号
  attrParam: Record<string, any>;  // 额外查询参数
  cVal?: string;                    // 当前选中值（可选）
  searchCondition?: string;         // 搜索关键词（仅远程搜索模式）
}
```

后端需要返回以下格式的数据：

```typescript
{
  result: {
    assSelect: CustomizeSelectConfig;  // 组件配置
    optionList: {                      // 选项列表
      cKeynumb: string | number;       // 选项值
      cKeyname: string;                // 选项标签
      cSlot?: string;                  // 附加信息（可选）
    }[]
  }
}
```

## 使用场景

### 1. 普通下拉选择（固定选项列表）

适用于选项数量不多且相对固定的场景，如状态选择、类型选择等。

```vue
<sunny-customize-select
  v-model="status"
  :c-num="'status_select'"
  placeholder="请选择状态"
/>
```

### 2. 远程搜索（动态选项列表）

适用于选项数量庞大的场景，如用户选择、商品选择等。

```vue
<sunny-customize-select
  v-model="userId"
  :c-num="'user_search'"
  :default-config="{ nType: 1, nSearchinterval: 700 }"
  placeholder="搜索用户..."
/>
```

### 3. 带上下文过滤

根据表单其他字段的值动态过滤选项。

```vue
<sunny-customize-select
  v-model="departmentId"
  :c-num="'department_select'"
  :attr-param="{ companyId: form.companyId }"
  placeholder="选择部门"
/>
```

### 4. 显示附加信息

在选项右侧显示部门、状态等附加信息。

```vue
<sunny-customize-select
  v-model="employeeId"
  :c-num="'employee_select'"
  :default-config="{ cLabelslotcol: 'department' }"
  placeholder="选择员工"
/>
```

## 注意事项

1. **接口依赖**：组件调用接口 `/core/assSelect/commonQuery` 获取配置和选项列表，请确保后端接口可用。
2. **防抖优化**：远程搜索模式内置了防抖功能，默认间隔为 700ms，可通过 `nSearchinterval` 调整。
3. **选项格式**：后端返回的选项列表必须包含 `cKeynumb`（值）和 `cKeyname`（标签）字段。
4. **兼容性**：组件支持 Element UI 的 `value` prop，同时也兼容 Vue 3 的 `modelValue`。
