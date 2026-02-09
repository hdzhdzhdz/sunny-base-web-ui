# BusinessSearch 业务搜索

组合式业务搜索组件，集成了 `SearchInputTag` 和 `SearchModal`，支持静态配置和动态后端配置。

## 基础用法 (静态配置)

通过 `type` 属性指定业务类型，组件会自动加载注册的静态配置。

<preview path="./demos/business-search/BasicUsage.vue" />

## 动态配置

通过 `c-num` 属性指定后端配置编码，组件会从 `/core/assDialog/openInit` 加载配置。

<preview path="./demos/business-search/DynamicUsage.vue" />

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 双向绑定的值 | `any[]` | `[]` |
| type | 业务类型 (加载静态配置) | `string` | - |
| cNum | 动态配置编码 (加载后端配置) | `string` | - |
| placeholder | 占位符 | `string` | `'请选择'` |
| multiple | 是否多选 | `boolean` | `true` |
| modalProps | 透传给 Modal 的属性 | `object` | `{}` |

### Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:modelValue | 更新绑定值 | `(value: any[])` |
| change | 值变化时触发 | `(value: any[])` |
