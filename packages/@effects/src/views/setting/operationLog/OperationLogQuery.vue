<script lang="tsx" setup>
import { reactive, ref } from 'vue'
import type { VxeGridProps, VxeGridListeners } from 'vxe-table'
import { useSunnyQueryGrid, useSunnyForm, SunnySearchPlan } from "@sunny-base-web/ui"
import { searchFormSchema, tableColumns, resourceConfig } from './config'
import type { OperationLogVO } from './types'
import { requestClient } from '@sunny-base-web/effects'
import { Filter } from "lucide-vue-next";


// ----------------------------------------------------------------------
// 1. Query Form Configuration
// ----------------------------------------------------------------------

const submitting = ref(false)

const [QueryForm, formApi] = useSunnyForm({
  layout: 'vertical',
  size: 'small',
  gridProps: {
    xGap: 16,
    yGap: 0,
    collapsed: true,
    collapsedRows: 1
  },
  showCollapseButton: true,
  showDefaultActions: true,
  submitOnEnter: true,
  submitButtonOptions: { loading: submitting },
  actionColProps: { span: 4 },
  schema: searchFormSchema
})

// ----------------------------------------------------------------------
// 2. Grid Configuration
// ----------------------------------------------------------------------

const gridOptions = reactive<VxeGridProps<OperationLogVO>>({
  id: 'OperationLogQuery',
  border: true,
  size: 'mini',
  showOverflow: true,
  height: 'auto',
  align: 'center',
  columnConfig: {
    resizable: true
  },
  pagerConfig: {
    enabled: true,
    size: 'mini',
    pageSize: 20,
    pageSizes: [10, 20, 50, 100]
  },
  toolbarConfig: {
    refresh: true,
    zoom: true,
    custom: true
  },
  customConfig: {
    mode: 'popup',
    storage: true
  },
  proxyConfig: {
    seq: true,
    response: {
      result: 'result.records',
      total: 'result.total'
    },
    ajax: {
      query: async ({ page }) => {
        const formValues = await formApi.getValues()

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
        }

        return requestClient.post('/core/assUserOperationLog/selectForPage', queryParams)
      }
    }
  },
  columns: tableColumns
})

const gridEvents: VxeGridListeners = {
  // Add grid events if needed
}

const [Grid, gridApi] = useSunnyQueryGrid({ gridOptions, gridEvents })

// ----------------------------------------------------------------------
// 3. Form Submit Handler
// ----------------------------------------------------------------------

// 设置表单提交回调，触发表格查询
formApi.setState({
  handleSubmit: async () => {
    submitting.value = true
    try {
      await gridApi.commitProxy('query')
    } finally {
      submitting.value = false
    }
  },
  handleReset: async () => {
    await formApi.resetForm()
    gridApi.commitProxy('query')
  }
})

// 全局回车触发查询
function handleGlobalEnter(e: KeyboardEvent) {
  // 排除多行文本框
  if (e.target instanceof HTMLTextAreaElement) {
    return
  }
  e.preventDefault()
  formApi.submitForm()
}

// ----------------------------------------------------------------------
// 4. Search Plan Configuration
// ----------------------------------------------------------------------

// 从配置中获取资源信息
const { resourceId, nResourceid } = resourceConfig;

// 搜索方案列表
const searchPlanList = ref([]);

// 当前选中的搜索方案
const currentSearchPlan = ref(undefined);

// 查询方案API实现
const searchPlanApi = {
  findAllByResourceid: (data) => requestClient.post('/core/assSearchplan/findAllByResourceid', data),
  findSearchPlanColsByPlanId: (data) => requestClient.post('/core/assSearchplan/findSearchPlanColsByPlanId', data),
  insert: (data) => requestClient.post('/core/assSearchplan/insert', data),
  update: (data) => requestClient.post('/core/assSearchplan/update', data),
  del: (data) => requestClient.post('/core/assSearchplan/delete', data),
  findDefSearchPlan: (data) => requestClient.post('/core/assSearchplan/findDefSearchPlan', data)
};

// 处理查询方案搜索
const handleSearchPlanSearch = async (formValues) => {
  // 设置表单值
  await formApi.setValues(formValues);
  // 执行搜索
  await gridApi.commitProxy('query');
};

// 处理默认查询方案加载完成
const handleDefaultPlanLoaded = async (formValues) => {
  // 设置表单值
  await formApi.setValues(formValues);
};

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
                :search-plan-list="searchPlanList"
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
                  class="px-3 py-1.5 border border-gray-300 rounded bg-white text-sm transition-all hover:border-blue-500 hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-60 mr-2"
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

<style scoped>
:deep(.arco-form-item) {
  margin-bottom: 0;
}

.operation-log-query {
  outline: none;
}
</style>
