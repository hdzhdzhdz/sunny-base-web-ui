# useList 钩子

`useList` 是一个用于快速构建列表页的组合式 API 钩子，它集成了表单查询、表格展示和搜索方案等功能，简化了列表页的开发流程。

## 功能特性

- 集成 `useSunnyForm` 和 `useSunnyQueryGrid`
- 支持表单查询和表格数据展示
- 内置搜索方案功能
- 全局回车触发查询
- 支持自定义查询函数

## 类型定义

```typescript
export function useList<T>(options: {
  /**
   * 表单配置
   */
  searchFormSchema: any[];
  /**
   * 表格列配置
   */
  tableColumns: any[];
  /**
   * 表格数据类型
   */
  dataType?: new () => T;
  /**
   * 资源配置
   */
  resourceConfig: {
    resourceId: string;
    nResourceid: number;
  };
  /**
   * 表格查询函数
   */
  queryFunction: (params: any) => Promise<any>;
})
```

## 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `searchFormSchema` | `any[]` | 搜索表单配置，遵循 SunnyForm 的 schema 格式 |
| `tableColumns` | `any[]` | 表格列配置，遵循 VxeTable 的 columns 格式 |
| `dataType` | `new () => T` | 表格数据类型（可选） |
| `resourceConfig` | `object` | 资源配置，包含 `resourceId` 和 `nResourceid` |
| `queryFunction` | `(params: any) => Promise<any>` | 表格查询函数，接收 `page` 和 `formValues` 参数 |

## 返回值

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `QueryForm` | `Component` | 查询表单组件 |
| `formApi` | `object` | 表单 API，用于操作表单 |
| `Grid` | `Component` | 表格组件 |
| `gridApi` | `object` | 表格 API，用于操作表格 |
| `submitting` | `Ref<boolean>` | 提交状态 |
| `handleGlobalEnter` | `(e: KeyboardEvent) => void` | 全局回车处理函数 |
| `searchPlanList` | `Ref<any[]>` | 搜索方案列表 |
| `currentSearchPlan` | `Ref<any>` | 当前选中的搜索方案 |
| `resourceId` | `string` | 资源 ID |
| `nResourceid` | `number` | 数字类型的资源 ID |
| `handleSearchPlanSearch` | `(formValues: any) => Promise<void>` | 处理搜索方案搜索 |
| `handleDefaultPlanLoaded` | `(formValues: any) => Promise<void>` | 处理默认搜索方案加载 |

## 使用示例

### 基本用法

```vue
<script lang="tsx" setup>
import { SunnySearchPlan } from "@sunny-base-web/ui"
import { searchFormSchema, tableColumns, resourceConfig } from './config'
import type { OperationLogVO } from './types'
import { requestClient, searchPlanApi, useList } from '@sunny-base-web/effects'
import { Filter } from "lucide-vue-next";

// 表格查询函数
const queryFunction = async ({ page, formValues }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    assUserOperationLog: {
      dCreatelist: formValues.dCreatelist || [],
      cModname: formValues.cModname || '',
      cSystem: formValues.cSystem || '',
      cDanju: formValues.cDanju || '',
      cUser: formValues.cUser || ''
    }
  };

  return requestClient.post('/core/assUserOperationLog/selectForPage', queryParams);
};

// 使用useList钩子
const {
  QueryForm,
  formApi,
  Grid,
  gridApi,
  submitting,
  handleGlobalEnter,
  searchPlanList,
  currentSearchPlan,
  resourceId,
  nResourceid,
  handleSearchPlanSearch,
  handleDefaultPlanLoaded
} = useList<OperationLogVO>({
  searchFormSchema,
  tableColumns,
  resourceConfig,
  queryFunction
});
</script>

<template>
  <div class="operation-log-query h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter" tabindex="-1">
    <!-- Main Container -->
    <div
      class="flex-1 bg-[var(--color-bg-2)] flex flex-col shadow-sm border border-[var(--color-border)] overflow-hidden rounded"
    >
      <!-- Search Form Area -->
      <div class="px-4 border-b py-2 pb-3 border-[var(--color-border)]">
        <QueryForm>
          <template #expand-before>
            <SunnySearchPlan
                :form-config="searchFormSchema"
                v-model:current-search-plan="currentSearchPlan"
                v-model:search-plan-list="searchPlanList"
                :resource-id="resourceId"
                :n-resourceid="nResourceid"
                :api="searchPlanApi"
                @search="handleSearchPlanSearch"
                @default-plan-loaded="handleDefaultPlanLoaded"
              >
              <template #trigger="{ open }">
                <button
                  type="button"
                  class="px-3 py-1.5 border border-[var(--color-border-2)] rounded bg-white text-sm transition-all hover:border-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-6))] disabled:cursor-not-allowed disabled:opacity-60 mr-2"
                  @click="open"
                  title="查询方案"
                >
                  <Filter class="w-4 h-4" />
                </button>
              </template>
            </SunnySearchPlan>
          </template>
        </QueryForm>
      </div>

      <!-- Data Grid Area -->
      <div class="flex-1 px-2 pt-1 overflow-hidden flex flex-col">
        <Grid class="flex-1" />
      </div>
    </div>
  </div>
</template>
```

### 配置文件示例

#### config.ts

```typescript
// 搜索表单配置
export const searchFormSchema = [
  {
    field: 'dCreatelist',
    component: 'DatePicker',
    label: '操作时间',
    props: {
      type: 'daterange',
      format: 'YYYY-MM-DD HH:mm:ss'
    }
  },
  {
    field: 'cModname',
    component: 'Input',
    label: '操作模块'
  },
  {
    field: 'cSystem',
    component: 'Input',
    label: '系统标识'
  },
  {
    field: 'cDanju',
    component: 'Input',
    label: '单据号'
  },
  {
    field: 'cUser',
    component: 'Input',
    label: '操作人'
  }
];

// 表格列配置
export const tableColumns = [
  {
    type: 'seq',
    width: 60,
    title: '序号'
  },
  {
    field: 'cUser',
    title: '操作人',
    minWidth: 120
  },
  {
    field: 'dCreatetime',
    title: '操作时间',
    minWidth: 180,
    formatter: ({ cellValue }) => {
      return cellValue ? new Date(cellValue).toLocaleString() : '';
    }
  },
  {
    field: 'cModname',
    title: '操作模块',
    minWidth: 150
  },
  {
    field: 'cSystem',
    title: '系统标识',
    minWidth: 120
  },
  {
    field: 'cDanju',
    title: '单据号',
    minWidth: 180
  },
  {
    field: 'cContent',
    title: '操作内容',
    minWidth: 200,
    showOverflow: true
  }
];

// 资源配置
export const resourceConfig = {
  resourceId: 'operationLog',
  nResourceid: 1001
};
```

## 模块调用 useList

### 1. 导入 useList 和相关依赖

在需要使用 `useList` 的模块中，首先导入 `useList`、`searchPlanApi` 和其他必要的依赖：

```typescript
import { requestClient, searchPlanApi, useList } from '@sunny-base-web/effects';
```

### 2. 定义查询函数

创建一个异步函数，用于处理表格数据的查询逻辑：

```typescript
const queryFunction = async ({ page, formValues }) => {
  // 构建查询参数
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    // 根据实际业务需求构建查询条件
    ...formValues
  };

  // 调用 API 获取数据
  return requestClient.post('/api/your-endpoint', queryParams);
};
```

### 3. 配置表单和表格

定义表单配置和表格列配置：

```typescript
// 表单配置
const searchFormSchema = [
  // 表单字段配置
];

// 表格列配置
const tableColumns = [
  // 表格列配置
];

// 资源配置
const resourceConfig = {
  resourceId: 'your-resource-id',
  nResourceid: 1000 // 资源 ID 数字
};
```

### 4. 使用 useList 钩子

调用 `useList` 钩子并解构返回的对象：

```typescript
const {
  QueryForm,
  formApi,
  Grid,
  gridApi,
  submitting,
  handleGlobalEnter,
  searchPlanList,
  currentSearchPlan,
  resourceId,
  nResourceid,
  handleSearchPlanSearch,
  handleDefaultPlanLoaded
} = useList<YourDataType>({
  searchFormSchema,
  tableColumns,
  resourceConfig,
  queryFunction
});
```

### 5. 在模板中使用组件

在 Vue 模板中使用 `QueryForm` 和 `Grid` 组件：

```vue
<template>
  <div @keydown.enter="handleGlobalEnter" tabindex="-1">
    <!-- 搜索表单 -->
    <QueryForm>
      <!-- 可选：添加搜索方案组件 -->
      <template #expand-before>
        <SunnySearchPlan
            :form-config="searchFormSchema"
            v-model:current-search-plan="currentSearchPlan"
            v-model:search-plan-list="searchPlanList"
            :resource-id="resourceId"
            :n-resourceid="nResourceid"
            :api="searchPlanApi"
            @search="handleSearchPlanSearch"
            @default-plan-loaded="handleDefaultPlanLoaded"
          >
          <!-- 搜索方案触发按钮 -->
          <template #trigger="{ open }">
            <button @click="open">查询方案</button>
          </template>
        </SunnySearchPlan>
      </template>
    </QueryForm>

    <!-- 表格 -->
    <Grid />
  </div>
</template>
```

## 搜索方案 API

`useList` 钩子集成了搜索方案功能，通过 `searchPlanApi` 提供以下方法：

| 方法 | 说明 |
|------|------|
| `findAllByResourceid` | 根据资源 ID 查询所有搜索方案 |
| `findSearchPlanColsByPlanId` | 根据方案 ID 查询搜索方案列配置 |
| `insert` | 新增搜索方案 |
| `update` | 更新搜索方案 |
| `del` | 删除搜索方案 |
| `findDefSearchPlan` | 查询默认搜索方案 |

## 最佳实践

1. **模块化配置**：将表单配置、表格配置和资源配置分离到单独的文件中，提高代码可维护性
2. **类型定义**：为表格数据添加 TypeScript 类型，提高代码类型安全性
3. **错误处理**：在 `queryFunction` 中添加适当的错误处理
4. **性能优化**：对于大数据量的表格，考虑使用虚拟滚动等性能优化手段
5. **用户体验**：添加加载状态、错误提示等用户体验优化

## 注意事项

- `useList` 钩子依赖于 `@sunny-base-web/ui` 中的 `useSunnyForm` 和 `useSunnyQueryGrid`
- 确保 `queryFunction` 返回的数据结构符合 VxeTable 的要求，即包含 `result.records` 和 `result.total`
- 搜索方案功能需要后端 API 支持，确保后端提供相应的接口
