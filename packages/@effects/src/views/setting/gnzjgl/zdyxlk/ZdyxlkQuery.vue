<script lang="tsx" setup>
import { SunnySearchPlan, SunnyIcon } from "@sunny-base-web/ui"
import { getZdyxlkConfig, resourceConfig } from './config'
import type { AssSelectVO } from './types'
import { requestClient, useList } from '@sunny-base-web/effects'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { Modal, Message } from '@arco-design/web-vue'
import ZdyxlkAdd from './ZdyxlkAdd.vue'
const ZdyxlkAddRef = ref()
const { t } = useI18n()

const { searchFormSchema, tableColumns } = getZdyxlkConfig({ t })

// ----------------------------------------------------------------------
// 1. List Configuration
// ----------------------------------------------------------------------

// 表格查询函数
const queryFunction = async ({ page, formValues }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    assSelect: formValues
  };

  const response = await requestClient.post('/core/assSelect/selectForPage', queryParams);
  
  // 将指定字段转换为字符串
  if (response.code === 200 && response.result && response.result.records) {
    response.result.records = response.result.records.map(record => ({
      ...record,
      nCbtype: record.nCbtype !== undefined ? String(record.nCbtype) : record.nCbtype,
      nType: record.nType !== undefined ? String(record.nType) : record.nType,
      nLikematch: record.nLikematch !== undefined ? String(record.nLikematch) : record.nLikematch,
      nSfcommon: record.nSfcommon !== undefined ? String(record.nSfcommon) : record.nSfcommon
    }));
  }
  
  return response;
};

// 表格事件
const gridEvents = {
  async toolbarButtonClick(params: any) {
    const selectRecords = [
      ...params.$grid.getCheckboxRecords()
    ]
    
    switch (params.button.code) {
      case 'zdyxlk/add':
        ZdyxlkAddRef.value.addInit()
        break
      case 'zdyxlk/edit':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        ZdyxlkAddRef.value.editInit(selectRecords[0])
        break
      case 'zdyxlk/del':
        if (selectRecords.length === 0) {
          Message.warning(t('zdyxlk.selectDeleteRecords'))
          return
        }
        Modal.confirm({
          title: t('zdyxlk.confirmDelete'),
          content: t('zdyxlk.confirmDeleteMultiple', { count: selectRecords.length }),
          onBeforeOk: async () => {
            const idList = selectRecords.map((row: any) => row.id)
            const res = await requestClient.post('/core/assSelect/delete', { idList })
            if (res.code === 200) {
              Message.success(res.message)
              params.$grid.commitProxy('query', {})
              return true
            } else {
              Message.error(res.message)
              return false
            }
          }
        })
        break
      default:
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
  resourceButtons,
  handleSearchPlanSearch,
  handleDefaultPlanLoaded
} = useList<AssSelectVO>({
  searchFormSchema,
  tableColumns,
  resourceConfig,
  queryFunction,
  gridEvents
});

// 过滤表格操作按钮
const filterColumnHandle = (row: AssSelectVO) => {
  return resourceButtons.value.filter(button => button.cSubArea === 'columnTable');
};

// 处理按钮点击
const toggleToolbarClick = async (button: any, row: AssSelectVO) => {
  const { handle } = button;
  
  switch (handle) {
    case 'zdyxlk/edit':
      // 编辑
      ZdyxlkAddRef.value.editInit(row)
      break;
    case 'zdyxlk/del':
      // 删除
      Modal.confirm({
        title: t('zdyxlk.confirmDelete'),
        content: t('zdyxlk.confirmDeleteSingle', { CTitle: row.CTitle }),
        onOk: async () => {
          try {
            const response = await requestClient.post('/core/assSelect/delete', { id: row.id })
            if (response.code === 200) {
              Message.success(response.message)
              gridApi.value?.refresh()
            } else {
              Message.error(response.message)
            }
          } catch (error) {
            console.error('删除失败:', error)
            Message.error(t('zdyxlk.deleteFailed'))
          }
        }
      })
      break;
    default:
      break;
  }
};

</script>

<template>
  <div class="zdyxlk-query h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter" tabindex="-1">
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
    
    <ZdyxlkAdd ref="ZdyxlkAddRef" @success="() => gridApi.commitProxy('query')" />
  </div>
</template>

<style scoped>
:deep(.arco-form-item) {
  margin-bottom: 0;
}

.zdyxlk-query {
  outline: none;
}
</style>