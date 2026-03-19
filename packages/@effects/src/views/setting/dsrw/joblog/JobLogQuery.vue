<script lang="tsx" setup>
import { SunnySearchPlan, SunnyIcon } from "@sunny-base-web/ui"
import { searchFormSchema, tableColumns, resourceConfig } from './config'
import type { JobLogVO } from './types'
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
    xxlJobLog: {
      jobDesc: formValues.jobDesc || '',
      triggerStatus: formValues.triggerStatus || '',
      startTime: formValues.startTime || '',
      endTime: formValues.endTime || ''
    }
  };
  return requestClient.post('/schedule/joblog/selectForPage', queryParams);
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
} = useList<JobLogVO>({
  searchFormSchema,
  tableColumns,
  resourceConfig,
  queryFunction
});

// 查看调度备注
const seeDdbz = (row: JobLogVO) => {
  console.log('查看调度备注:', row);
  // 这里可以添加查看调度备注的逻辑
};

// 查看执行备注
const seeMsg = (msg: string) => {
  console.log('查看执行备注:', msg);
  // 这里可以添加查看执行备注的逻辑
};

// 查看执行日志
const seeZxrz = (row: JobLogVO) => {
  console.log('查看执行日志:', row);
  // 这里可以添加查看执行日志的逻辑
};

</script>

<template>
  <div class="job-log-query h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter" tabindex="-1">
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
          <!-- 调度备注插槽 -->
          <template #handleDdbzSlot="{ row }">
            <button
              type="button"
              class="text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-5))]"
              @click="seeDdbz(row)"
            >
              查看
            </button>
          </template>
          
          <!-- 执行备注插槽 -->
          <template #handleMsgSlot="{ row }">
            <button
              v-if="row.handleMsg"
              type="button"
              class="text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-5))]"
              @click="seeMsg(row.handleMsg)"
            >
              查看
            </button>
          </template>
          
          <!-- 执行日志插槽 -->
          <template #handleZxrzSlot="{ row }">
            <button
              v-if="row.nShow === 1"
              type="button"
              class="text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-5))]"
              @click="seeZxrz(row)"
            >
              查看
            </button>
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

.job-log-query {
  outline: none;
}
</style>