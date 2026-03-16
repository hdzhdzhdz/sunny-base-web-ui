## CustomizeSelect 自定义下拉框

业务化下拉选择组件，支持普通选择与远程搜索两种模式。组件不直接调用接口，所有数据请求与格式转换通过“适配器”完成，便于在不同系统复用与接入。

### 基础用法

<preview path="./demos/customize-select/BasicUsage.vue" title="基础用法" description="演示普通模式与远程搜索模式" />

### 适配器注册

在应用入口注册 customizeSelectAdapter，统一管理接口地址与数据转换：

```ts
// apps/web/src/bootstrap.ts
import { setupBusinessForm } from '@sunny-base-web/effects'

setupBusinessForm({
  config: {
    customizeSelectAdapter: {
      query: async (params) => {
        // 默认适配器已提供 /core/assSelect/commonQuery 的实现
        // 这里可按需覆盖，返回 { options, config }
        const res = await requestClient.post('/core/assSelect/commonQuery', params)
        const data = res?.result || res
        return {
          options: data?.optionList || [],
          config: data?.assSelect || undefined,
        }
      }
    }
  }
})
```

文档站点也已在主题入口注册了适配器，便于预览：

```ts
// docs/src/.vitepress/theme/index.ts
setupBusinessForm({
  config: {
    customizeSelectAdapter: {
      query: async (params) => {
        const res = await axios.post('/core/assSelect/commonQuery', params)
        const data = res.data?.result || res.data
        return {
          options: data?.optionList || [],
          config: data?.assSelect || undefined,
        }
      }
    }
  }
})
```

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue / value | 绑定值 | `string \| number` | `''` |
| cNum | 查询编号，用于后端配置查询 | `string \| number` | `''` |
| defaultQuery | 是否在挂载时拉取配置/选项 | `boolean` | `true` |
| defaultConfig | 本地默认配置（与服务端返回合并） | `object` | `{}` |
| attrParam | 透传给后端的上下文参数 | `Record<string, any>` | `{}` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 值变化（v-model） | `value: string \| number` |
| selectChange | 选项变化 | `value: string \| number, instance: any` |
| change | 值变化（兼容） | `{ value, $this }` |

### 工作机制

- 组件内部通过全局表单配置的 `customizeSelectAdapter.query(params)` 获取数据；
- 默认适配后端接口 `/core/assSelect/commonQuery`，返回：
  - `options`: `{ cKeynumb, cKeyname, cSlot? }[]`；
  - `config`: `{ nType, cLabelslotcol, nSearchinterval }`；
- 支持覆盖适配器以适配不同的后端格式；
- `nType = 1` 开启远程搜索，`nSearchinterval` 控制防抖。

### 注意事项

1. 推荐在应用入口统一注册/覆盖适配器，而不是在组件内写死接口；
2. 对于跨系统对接，只需替换适配器中的数据映射逻辑；
3. 如果需要在 Tag 中展示附加信息，请在后端返回 `cSlot`，并可通过 `defaultConfig.cLabelslotcol` 指示展示字段。
