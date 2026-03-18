<script lang="tsx" setup>
import { ref } from 'vue'
import { getUserConfig } from './config'
import { requestClient, searchPlanApi, useList } from '@sunny-base-web/effects'
import type { VxeGridProps, VxeGridListeners } from 'vxe-table'
import { Modal, Message } from '@arco-design/web-vue';
import { useExportModal } from '@sunny-base-web/ui'
import { useRouter } from 'vue-router'
const router = useRouter()

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const { searchFormSchema, tableColumns, resourceConfig } = getUserConfig({ t })

const queryFunction = async ({ page, formValues }: { page: { currentPage: number; pageSize: number }; formValues: Record<string, any> }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    assUserOperationLog: formValues
  };

  return requestClient.post('/core/authUser/selectForPage', queryParams);
};

const gridEvents:VxeGridListeners = {
  async toolbarButtonClick (params: any) {
    console.log(params)
    const selectRecords = [
      ...params.$grid.getCheckboxReserveRecords(), // 保留选中的记录
      ...params.$grid.getCheckboxRecords() // 当前选中的记录
    ]
    switch (params.button.code) {
      case 'userManagement/add':
        Message.info(params.button.name)
        break
      case 'userManagement/delete': {
        if (selectRecords.length === 0) {
          Message.warning('请至少选择一条记录！')
          return
        }
        Modal.confirm({
          title: '提示',
          content: `确定删除选中 ${selectRecords.length} 项吗？`,
          onBeforeOk: async () => {
            // 调用删除接口
            await new Promise(resolve => setTimeout(resolve, 3000));
            // 刷新表格数据
            params.$grid.commitProxy('query', {})
            return true;
          }
        });
        break
      }
      case 'userManagement/update':
        if (selectRecords.length !== 1) {
          Message.warning('请选择一条记录！')
          return
        }
        Message.info(`${params.button.name}：${JSON.stringify(selectRecords[0])}`)
        break
      case 'userManagement/detail':
        if (selectRecords.length !== 1) {
          Message.warning('请选择一条记录！')
          return
        }
        Message.info(`${params.button.name}：${JSON.stringify(selectRecords[0])}`)
        break
      case 'daoru/show':
        importModalApi.open({
          nModid: router.currentRoute.value.meta.id,
          nButtonid: params.button.nButtonid,
        })
        break
      case 'daochu/show':
        const formValues = await formApi.getValues()
        exportModalApi.open({
          nmodid: router.currentRoute.value.meta.id,
          nButtonid: params.button.nButtonid,
          conditionMap: formValues
        })
        break
    }
  }
}

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
} = useList<any>({
  searchFormSchema,
  tableColumns,
  resourceConfig,
  queryFunction,
  gridEvents,
});

const [exportModal, exportModalApi] = useExportModal({})
const [importModal, importModalApi] = useImportModal({})
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
        <Grid class="flex-1" />
      </div>

      <exportModal />
      <importModal />
    </div>
  </div>
</template>
