# BusinessSearch 业务搜索

组合式业务搜索组件，集成了 `SearchInputTag` 和 `SearchModal`，支持静态配置和动态后端配置。

## 基础用法 (静态配置)

通过 `type` 属性指定业务类型，组件会自动加载注册的静态配置。

<preview path="./demos/business-search/BasicUsage.vue" />

## 动态配置

通过 `c-num` 属性指定后端配置编码，组件会从 `/core/assDialog/openInit` 加载配置。

<preview path="./demos/business-search/DynamicUsage.vue" />

## 在 SunnyForm 中使用

已将组件注册到 `SunnyForm` 的组件映射表中，可直接通过字符串 `SunnyBusinessSearch` 使用。

<preview path="./demos/business-search/FormUsage.vue" />

### 高级用法指南

在 `SunnyForm` 中使用 `SunnyBusinessSearch` 时，可以利用 Form 的高级特性来处理复杂的数据交互需求。

#### 1. 自动值转换 (`objectToValueFields`)

默认情况下，`SunnyBusinessSearch` 返回的是对象数组（例如 `[{ id: '1', name: 'A' }]`）。但在提交表单给后端时，通常只需要 ID 字符串（例如 `'1,2,3'`）。

`SunnyForm` 提供了 `objectToValueFields` 配置项，可以自动完成**双向转换**。

```typescript
const [Form, formApi] = useSunnyForm({
  // 指定哪些字段需要进行 "对象数组 <-> 值字符串" 的双向转换
  objectToValueFields: ['machineCode'],
  schema: [
    {
      fieldName: 'machineCode',
      component: 'SunnyBusinessSearch',
      componentProps: {
        modalProps: {
          // 必须配置 fieldNames，告诉 Form 哪个字段是 value
          fieldNames: { value: 'C_DEVICE_NO', label: 'C_DEVICE_NAME' }
        }
      }
    }
  ]
});
```

**工作原理：**

| 操作 | 转换方向 | 说明 |
| --- | --- | --- |
| `setValues()` | 字符串 → 对象数组 | `'1,2,3'` → `[{ C_DEVICE_NO: '1', C_DEVICE_NAME: '1' }, ...]` |
| `getValues()` / 提交 | 对象数组 → 字符串 | `[{ C_DEVICE_NO: '1', ... }, ...]` → `'1,2,3'` |

**设置值示例：**

```typescript
// 从后端获取数据后，直接设置字符串格式即可
const backendData = { machineCode: 'M001,M002' };
await formApi.setValues(backendData);
// 内部自动转换成组件需要的对象数组格式

// 也可以设置对象数组格式（兼容旧写法）
await formApi.setValues({
  machineCode: [
    { C_DEVICE_NO: 'M001', C_DEVICE_NAME: '设备1' },
    { C_DEVICE_NO: 'M002', C_DEVICE_NAME: '设备2' }
  ]
});
```

#### 2. 动态响应式参数

如果组件的参数（如 `cNum`）依赖于页面上的其他变量，可以使用函数形式的 `componentProps`。

```typescript
const cNum = ref('MACHINE_SBBH');

// ...
schema: [
  {
    fieldName: 'machineCode',
    component: 'SunnyBusinessSearch',
    // 使用函数返回 props，当依赖变化时组件会自动更新
    componentProps: () => ({
      cNum: cNum.value, // 响应式依赖
      placeholder: '动态配置...'
    })
  }
]
```

#### 3. 字段映射 (`fieldNames`)

通过 `modalProps.fieldNames` 自定义数据字段映射，适配不同的后端接口格式。

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| value | 唯一标识字段名 | `value` |
| label | 显示文本字段名 | `label` |

```typescript
modalProps: {
  fieldNames: {
    value: 'id',       // 选中值的唯一标识
    label: 'userName'  // 显示在 Tag 中的文本
  }
}
```

## API 适配器配置

### 配置入口

在应用入口（`apps/web/src/bootstrap.ts`）调用 `setupBusinessForm()` 初始化配置：

```typescript
import { setupBusinessForm } from '@sunny-base-web/effects';

// 方式1：使用默认配置（适用于标准业务系统）
setupBusinessForm();

// 方式2：覆盖部分配置
setupBusinessForm({
  config: {
    businessSearchAdapter: {
      // 只覆盖 loadConfig，search 仍使用默认实现
      loadConfig: async (cNum) => {
        return myCustomApi.loadConfig(cNum);
      },
    },
  },
});

// 方式3：完全自定义（适用于非标准业务系统）
setupBusinessForm({
  config: {
    businessSearchAdapter: {
      loadConfig: async (cNum) => {
        const res = await myApi.getConfig(cNum);
        // 完全自定义转换逻辑
        return {
          title: res.title,
          formSchema: res.fields,
          tableColumns: res.columns,
        };
      },
      search: async (params) => {
        const res = await myApi.search(params);
        return {
          records: res.data,
          total: res.count,
        };
      },
    },
  },
  defineRules: {
    phone: (value) => /^1[3-9]\d{9}$/.test(value) || '请输入正确的手机号',
  },
});
```

### 默认适配器的转换逻辑

默认的 `businessSearchAdapter` 会自动处理以下转换：

#### 1. loadConfig 配置转换

```
后端格式 (openInit)               →  组件格式 (BusinessSearchConfig)
─────────────────────────────────────────────────────────────────────
{                                  →  {
  "cTitle": "设备选择",                  title: "设备选择",
  "cWidth": "800",                       width: "800px",
  "cHeight": "500",                      contentHeight: 500,
  "cSelectionMode": "multiple",          multiple: true,

  "conditions": [                        formSchema: [
    {                                        {
      "label": "设备名称",                      label: "设备名称",
      "type": "input",                          fieldName: "C_DEVICE_NAME",
      "prop": "C_DEVICE_NAME"                   component: "Input"
    }                                        }
  ],                                     ],

  "tableCols": [                         tableColumns: [
    {                                        {
      "label": "设备编号",                      title: "设备编号",
      "prop": "C_DEVICE_NO",                   field: "C_DEVICE_NO"
      "width": 150                             width: 150
    }                                        }
  ]                                      ]
}                                      }
```

#### 2. search 参数转换

```
前端参数                           →  后端参数 (selectForPageCommon)
─────────────────────────────────────────────────────────────────────
{                                  →  {
  "cNum": "MACHINE_SBBH",                "sqlNum": "MACHINE_SBBH",
  "page": 1,                             "pageNo": 1,
  "pageSize": 20,                        "pageSize": 20,
  "C_DEVICE_NAME": "泵"                  "conditions": {
                                           "C_DEVICE_NAME": "泵"
                                         }
}                                      }
```

#### 3. search 结果转换

```
后端结果                           →  前端结果
─────────────────────────────────────────────────────────────────────
{                                  →  {
  "result": {                            records: [...],
    "list": [...] | "records": [...]     total: 100
    "totalSize" | "total": 100         }
  }
}
```

---

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
