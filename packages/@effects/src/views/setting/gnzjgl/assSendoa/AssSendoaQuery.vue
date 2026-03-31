<script lang="tsx" setup>
import { getAssSendoaConfig, resourceConfig } from './config'
import type { AssSendoaVO } from './types'
import { requestClient, useList } from '@sunny-base-web/effects'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { Modal, Message } from '@arco-design/web-vue'
import AssSendoaAdd from './AssSendoaAdd.vue'
const AssSendoaAddRef = ref()
const { t } = useI18n()

const { searchFormSchema, tableColumns } = getAssSendoaConfig({ t })

// ----------------------------------------------------------------------
// 1. List Configuration
// ----------------------------------------------------------------------

// 表格查询函数
const queryFunction = async ({ page, formValues }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    assSendoa: formValues
  };

  const response = await requestClient.post('/core/assSendoa/selectForPage', queryParams);
  
  // 将每一行数据的nSign字段值转换为字符串
  if (response.result && response.result.records) {
    response.result.records.forEach((row: any) => {
      if (row.nSign !== undefined) {
        row.nSign = String(row.nSign);
      }
    });
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
      case 'assSendoa/add':
        AssSendoaAddRef.value.addInit()
        break
      case 'assSendoa/edit':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        AssSendoaAddRef.value.editInit(selectRecords[0])
        break
      case 'assSendoa/del':
        if (selectRecords.length === 0) {
          Message.warning(t('assSendoa.selectDeleteRecords'))
          return
        }
        Modal.confirm({
          title: t('assSendoa.confirmDelete'),
          content: t('assSendoa.confirmDeleteMultiple', { count: selectRecords.length }),
          onBeforeOk: async () => {
            const idList = selectRecords.map((row: any) => row.id)
            const res = await requestClient.post('/core/assSendoa/delete', { idList })
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
} = useList<AssSendoaVO>({
  searchFormSchema,
  tableColumns,
  resourceConfig,
  queryFunction,
  gridEvents
});

// 过滤表格操作按钮
const filterColumnHandle = (row: AssSendoaVO) => {
  return resourceButtons.value.filter(button => button.cSubArea === 'columnTable');
};

// 处理按钮点击
const toggleToolbarClick = async (button: any, row: AssSendoaVO) => {
  const { handle } = button;
  
  switch (handle) {
    case 'assSendoa/edit':
      // 编辑
      AssSendoaAddRef.value.editInit(row)
      break;
    case 'assSendoa/del':
      // 删除
      Modal.confirm({
        title: t('assSendoa.confirmDelete'),
        content: t('assSendoa.confirmDeleteSingle', { cModnumb: row.cModnumb }),
        onOk: async () => {
          try {
            const response = await requestClient.post('/core/assSendoa/delete', { id: row.id })
            if (response.code === 200) {
              Message.success(response.message)
              gridApi.value?.refresh()
            } else {
              Message.error(response.message)
            }
          } catch (error) {
            console.error('删除失败:', error)
            Message.error(t('assSendoa.deleteFailed'))
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
  <div class="assSendoa-query h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter" tabindex="-1">
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
    
    <AssSendoaAdd ref="AssSendoaAddRef" @success="() => gridApi.commitProxy('query')" />
  </div>
</template>

<style scoped>
:deep(.arco-form-item) {
  margin-bottom: 0;
}

.assSendoa-query {
  outline: none;
}
</style>