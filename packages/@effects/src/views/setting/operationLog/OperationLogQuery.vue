<script lang="tsx" setup>
import { SunnySearchPlan, SunnyIcon } from "@sunny-base-web/ui"
import { getOperationLogConfig, resourceConfig } from './config'
import type { OperationLogVO } from './types'
import { requestClient, useList } from '@sunny-base-web/effects'
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'
const { t } = useI18n()

const { searchFormSchema, tableColumns } = getOperationLogConfig({ t })

// 接口地址弹窗状态
const urlVisible = ref(false)
const urlContent = ref('')
const urlLoading = ref(false)

// 格式化显示内容
const formattedContent = computed(() => {
  if (!urlContent.value) return ''

  try {
    // 尝试解析为 JSON 并格式化
    const parsed = JSON.parse(urlContent.value)
    return JSON.stringify(parsed, null, 2)
  } catch {
    // 如果不是 JSON，直接返回原内容
    return urlContent.value
  }
})


// ----------------------------------------------------------------------
// 1. List Configuration
// ----------------------------------------------------------------------

// 表格查询函数
const queryFunction = async ({ page, formValues }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    assUserOperationLog: formValues
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

// 查看接口地址详情
const seeUrl = async (row: OperationLogVO) => {
  urlContent.value = ''
  urlVisible.value = true
  urlLoading.value = true
  try {
    const res = await requestClient.post('/core/assUserOperationLog/findInterfaceParam', {
      assUserOperationLog: { id: row.id }
    })
    urlContent.value = res.result.cData || ''
  } finally {
    urlLoading.value = false
  }
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
        <QueryForm />
      </div>

      <!-- Data Grid Area -->
      <div class="flex-1 px-2 pt-1 overflow-hidden flex flex-col">
        <Grid class="flex-1">
          <!-- 接口地址插槽 -->
          <template #cUrlSlot="{ row }">
            <button
              type="button"
              class="text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-5))]"
              @click="seeUrl(row)"
            >
              {{ row.cUrl }}
            </button>
          </template>
        </Grid>
      </div>
    </div>

    <!-- 接口地址弹窗 -->
    <a-modal
      v-model:visible="urlVisible"
      :footer="false"
      :mask-closable="true"
      width="800px"
    >
      <template #title>
        {{ t('operationLog.apiParamTitle') }}
      </template>
      <a-spin :loading="urlLoading" class="w-full">
        <div class="p-5">
          <div v-if="formattedContent" class="border border-gray-300 rounded-md bg-white">
            <div class="flex items-center justify-between mb-2 px-3 py-2 bg-gray-50 border-b border-gray-300">
              <div class="text-sm font-medium text-gray-700">JSON 数据</div>
              <div class="text-xs text-gray-500">JavaScript</div>
            </div>
            <a-textarea
              :model-value="formattedContent"
              :auto-size="{ minRows: 10, maxRows: 20 }"
              readonly
              class="font-mono text-sm w-full"
            />
          </div>
          <a-empty v-else :description="t('operationLog.apiDetailNoData')" />
        </div>
      </a-spin>
      <div class="flex justify-center mt-4">
        <a-button type="primary" @click="urlVisible = false">{{ t('operationLog.apiDetailConfirm') }}</a-button>
      </div>
    </a-modal>
  </div>
</template>


