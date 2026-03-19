<script lang="tsx" setup>
import { SunnySearchPlan, SunnyIcon } from "@sunny-base-web/ui"
import { searchFormSchema, tableColumns, resourceConfig } from './config'
import type { JobGroupVO } from './types'
import { requestClient } from '../../../../api/request'
import { searchPlanApi, useList } from '../../../../hooks/useList'

// ----------------------------------------------------------------------
// 1. List Configuration
// ----------------------------------------------------------------------

// 表格查询函数
const queryFunction = async ({ page, formValues }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    xxlJobGroup: {
      jobGroupTitle: formValues.jobGroupTitle || '',
      jobGroup: formValues.jobGroup || '',
      status: formValues.status || ''
    }
  };

  return requestClient.post('/schedule/jobgroup/selectForPage', queryParams);
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
  resourceButtons,
  handleSearchPlanSearch,
  handleDefaultPlanLoaded
} = useList<JobGroupVO>({
  searchFormSchema,
  tableColumns,
  resourceConfig,
  queryFunction
});

// 过滤表格操作按钮
const filterColumnHandle = (row: JobGroupVO) => {
  return resourceButtons.value.filter(button => button.cSubArea === 'columnTable');
};

// 处理按钮点击
const toggleToolbarClick = (button: any, row: JobGroupVO) => {
  console.log('按钮点击:', button, row);
  // 这里可以添加按钮点击的具体逻辑
};

</script>

<template>
  <div class="job-group-query h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter" tabindex="-1">
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
                  <SunnyIcon icon="lucide:filter" class="w-4 h-4" />
                </button>
              </template>
            </SunnySearchPlan>
          </template>
        </QueryForm>
      </div>

      <!-- Data Grid Area -->
      <div class="flex-1 px-2 pt-1 overflow-hidden flex flex-col">
        <Grid class="flex-1">
          <!-- 操作列插槽 -->
          <template #actionSlot="{ row }">
            <template v-for="bt in filterColumnHandle(row)" :key="bt.id">
              <button
                type="button"
                class="text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-5))] mr-2"
                @click="toggleToolbarClick(bt, row)"
              >
                {{ bt.label }}
              </button>
            </template>
          </template>
        </Grid>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.arco-form-item) {
  margin-bottom: 0;
}

.job-group-query {
  outline: none;
}
</style>