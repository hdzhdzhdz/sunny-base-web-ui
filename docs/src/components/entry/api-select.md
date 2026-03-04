# ApiSelect API 下拉选择器

根据依赖字段自动触发接口请求的下拉选择器组件。支持单选/多选、搜索输入，可灵活配置参数映射和结果转换。

## 主要特性

- **自动联动**：监听依赖字段变化，自动触发接口请求
- **输入搜索**：支持用户输入关键字实时搜索（远程搜索）
- **灵活配置**：支持自定义参数映射和结果转换
- **单/多选**：多选时自动使用 BatchSelect，支持全选、批量粘贴
- **表单集成**：完美适配 SunnyForm Schema 配置

## 基础用法

在表单中使用，监听 `category` 字段变化自动请求商品列表：

<preview path="./demos/api-select/BasicUsage.vue" title="基础用法" description="简单的表单联动" />

## 多级联动

支持监听多个字段，实现更复杂的联动场景：

<preview path="./demos/api-select/FormLinkage.vue" title="多级联动" description="省份-城市-区县三级联动" />

## 多选模式

启用多选时，自动使用 BatchSelect 组件：

<preview path="./demos/api-select/Multiple.vue" title="多选模式" description="支持全选、批量粘贴" />

## 输入搜索

开启 `allowSearch` 支持用户输入搜索，输入时会实时触发接口请求：

<preview path="./demos/api-select/Searchable.vue" title="输入搜索" description="用户输入时触发远程搜索" />

## 参数映射

通过 `paramsMapper` 自定义请求参数：

<preview path="./demos/api-select/ParamsMapper.vue" title="参数映射" description="自定义请求参数格式" />

## 在 SunnyForm 中使用

ApiSelect 完美支持 SunnyForm 的 Schema 配置：

```typescript
const schema: FormSchema[] = [
  {
    fieldName: 'province',
    label: '省份',
    component: 'SunnySelect',
    componentProps: {
      options: [
        { label: '北京', value: 'bj' },
        { label: '上海', value: 'sh' },
      ],
    },
  },
  {
    fieldName: 'city',
    label: '城市',
    component: 'SunnyApiSelect',
    componentProps: {
      deps: ['province'],
      api: {
        api: (params) => requestClient.get('/api/cities', { params }),
        paramsMapper: (formValues, depValues, searchValue) => ({
          province: depValues.province,
          // 如果同时开启 allowSearch，searchValue 会有值
          keyword: searchValue?.keyword,
        }),
        resultMapper: (res) => res.data.map(item => ({
          label: item.cityName,
          value: item.cityCode,
        })),
      },
      placeholder: '请选择城市',
    },
    dependencies: {
      // 省份未选择时禁用城市选择
      disabled: (values) => !values.province,
    },
  },
];
```

## 搜索 + 联动组合使用

可以同时开启搜索和联动，实现选择公司后搜索该公司下的用户：

```typescript
const schema: FormSchema[] = [
  {
    fieldName: 'companyId',
    label: '公司',
    component: 'SunnySelect',
    componentProps: {
      options: [
        { label: '公司A', value: '1' },
        { label: '公司B', value: '2' },
      ],
    },
  },
  {
    fieldName: 'userId',
    label: '用户',
    component: 'SunnyApiSelect',
    componentProps: {
      deps: ['companyId'],
      allowSearch: true,
      searchField: 'keyword',
      api: {
        api: fetchUserList,
        paramsMapper: (_formValues, depValues, searchValue) => ({
          companyId: depValues.companyId,      // 来自联动
          keyword: searchValue?.keyword,       // 来自搜索输入
        }),
        resultMapper: (res) => res.data.list.map(item => ({
          label: item.userName,
          value: item.id,
        })),
      },
      placeholder: '请选择或输入用户名搜索',
    },
    dependencies: {
      disabled: (values) => !values.companyId,
    },
  },
];
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| deps | 依赖字段数组，这些字段变化时触发请求 | `string[]` | `[]` |
| api | 接口配置，可以是函数或配置对象 | `ApiConfig \| Function` | **必填** |
| multiple | 是否多选 | `boolean` | `false` |
| immediate | 是否立即触发（组件挂载时） | `boolean` | `true` |
| placeholder | 占位文本 | `string` | `'请选择'` |
| allowClear | 允许清空 | `boolean` | `true` |
| disabled | 禁用状态 | `boolean` | `false` |
| showLoading | 显示加载状态 | `boolean` | `true` |
| clearOptionsWhenEmpty | 依赖字段为空时清空选项 | `boolean` | `true` |
| extraParams | 额外的请求参数 | `Record<string, any>` | - |
| **allowSearch** | **是否支持搜索输入** | `boolean` | `false` |
| **searchField** | **搜索参数字段名** | `string` | `'keyword'` |
| **searchDebounce** | **搜索防抖时间(ms)** | `number` | `300` |

### ApiConfig 配置

```typescript
interface ApiSelectApiConfig {
  /** 接口请求函数 */
  api: (params: Record<string, any>) => Promise<any>;
  /** 参数映射函数 */
  paramsMapper?: (
    formValues: Record<string, any>,
    depValues: Record<string, any>,
    searchValue?: Record<string, any>
  ) => Record<string, any>;
  /** 结果映射函数 */
  resultMapper?: (result: any) => SelectOption[];
}
```

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 选中值变化时触发 | `value: any` |
| change | 选中值变化时触发 | `value: any` |
| optionsLoaded | 选项加载完成时触发 | `options: SelectOption[]` |
| error | 请求失败时触发 | `error: Error` |

### 方法

通过 ref 可以访问组件实例方法：

```typescript
const apiSelectRef = ref<InstanceType<typeof SunnyApiSelect>>();

// 重新加载选项
apiSelectRef.value?.fetchOptions();
```
