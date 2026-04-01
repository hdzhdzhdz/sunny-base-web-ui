<script lang="tsx" setup>
import { getGgcxtcConfig, resourceConfig } from './config'
import type { GgcxtcVO } from './types'
import { requestClient, useList } from '@sunny-base-web/effects'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { Modal, Message } from '@arco-design/web-vue'
import GgcxtcReview from './GgcxtcReview.vue'

const { t } = useI18n()

const { searchFormSchema, tableColumns } = getGgcxtcConfig({ t })

// 预览弹窗控制
const reviewVisible = ref(false)
const reviewCNum = ref('')

// ----------------------------------------------------------------------
// 1. List Configuration
// ----------------------------------------------------------------------

// 表格查询函数
const queryFunction = async ({ page, formValues }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    assDialog: formValues
  };

  const response = await requestClient.post('/core/assDialog/selectForPage', queryParams);
  
  // 将每一行数据的nCbtype和nSfcommon字段值转换为字符串
  if (response.result && response.result.records) {
    response.result.records.forEach((row: any) => {
      if (row.nCbtype !== undefined) {
        row.nCbtype = String(row.nCbtype);
      }
      if (row.nSfcommon !== undefined) {
        row.nSfcommon = String(row.nSfcommon);
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
      case 'ggcxtc/add':
        Message.info('新增功能开发中')
        break
      case 'ggcxtc/edit':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        Message.info('修改功能开发中')
        break
      case 'ggcxtc/review':
        if (selectRecords.length !== 1) {
          Message.warning(t('common.selectOne'))
          return
        }
        reviewCNum.value = selectRecords[0].cNum
        reviewVisible.value = true
        break
      case 'ggcxtc/del':
        if (selectRecords.length === 0) {
          Message.warning(t('ggcxtc.selectDeleteRecords'))
          return
        }
        Modal.confirm({
          title: t('ggcxtc.confirmDelete'),
          content: t('ggcxtc.confirmDeleteMultiple', { count: selectRecords.length }),
          onBeforeOk: async () => {
            const idList = selectRecords.map((row: any) => row.id)
            const res = await requestClient.post('/core/assDialog/delete', { idList })
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
} = useList<GgcxtcVO>({
  searchFormSchema,
  tableColumns,
  resourceConfig,
  queryFunction,
  gridEvents
});

// 过滤表格操作按钮
const filterColumnHandle = (row: GgcxtcVO) => {
  return resourceButtons.value.filter(button => button.cSubArea === 'columnTable');
};

// 处理按钮点击
const toggleToolbarClick = async (button: any, row: GgcxtcVO) => {
  const { handle } = button;
  
  switch (handle) {
    case 'ggcxtc/add':
      Message.info('新增功能开发中')
      break;
    case 'ggcxtc/edit':
      Message.info('修改功能开发中')
      break;
    case 'ggcxtc/review':
      reviewCNum.value = row.cNum
      reviewVisible.value = true
      break;
    case 'ggcxtc/del':
      // 删除
      Modal.confirm({
        title: t('ggcxtc.confirmDelete'),
        content: t('ggcxtc.confirmDeleteSingle', { cTitle: row.cTitle }),
        onOk: async () => {
          try {
            const response = await requestClient.post('/core/assDialog/delete', { id: row.id })
            if (response.code === 200) {
              Message.success(response.message)
              gridApi.value?.refresh()
            } else {
              Message.error(response.message)
            }
          } catch (error) {
            console.error('删除失败:', error)
            Message.error(t('ggcxtc.deleteFailed'))
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
  <div class="ggcxtc-query h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter" tabindex="-1">
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
    
    <!-- 预览弹窗 -->
    <GgcxtcReview
      :visible="reviewVisible"
      :c-num="reviewCNum"
      @close="reviewVisible = false"
    />
  </div>
</template>

<style scoped>
:deep(.arco-form-item) {
  margin-bottom: 0;
}

.ggcxtc-query {
  outline: none;
}
</style>