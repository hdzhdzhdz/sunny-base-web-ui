<script lang="tsx" setup>
import { SunnySearchPlan, SunnyIcon } from "@sunny-base-web/ui"
import { getJobLogConfig, resourceConfig } from './config'
import type { JobLogVO } from './types'
import { requestClient, useList } from '@sunny-base-web/effects'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const { searchFormSchema, tableColumns } = getJobLogConfig({ t })

// ----------------------------------------------------------------------
// 1. List Configuration
// ----------------------------------------------------------------------

// 表格查询函数
const queryFunction = async ({ page, formValues }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    xxlJobLog: formValues
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
        <QueryForm />
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
              {{ t('joblog.view') }}
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
              {{ t('joblog.view') }}
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
              {{ t('joblog.view') }}
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