<script lang="tsx" setup>
import type { VxeGridProps, VxeGridListeners } from 'vxe-table'
import { SunnySearchPlan, SunnyIcon } from "@sunny-base-web/ui"
import { getJobGroupConfig, resourceConfig } from './config'
import type { JobGroupVO } from './types'
import { requestClient, useList } from '@sunny-base-web/effects'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { Modal, Message } from '@arco-design/web-vue'
import JobGroupForm from './JobGroupForm.vue'
const { t } = useI18n()

const { searchFormSchema, tableColumns } = getJobGroupConfig({ t })

// 表单弹窗状态
const formVisible = ref(false)
const formRef = ref<InstanceType<typeof JobGroupForm> | null>(null)

// ----------------------------------------------------------------------
// 1. List Configuration
// ----------------------------------------------------------------------

// 表格查询函数
const queryFunction = async ({ page, formValues }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    xxlJobGroup: formValues
  };

  return requestClient.post('/schedule/jobgroup/selectForPage', queryParams);
};
// 表格事件
const gridEvents = {
  async toolbarButtonClick(params: any) {
    const selectRecords = [
      ...params.$grid.getCheckboxRecords()
    ]
    
    switch (params.button.code) {
      case 'jobgroup/add':
        // 新增
        if (formRef.value) {
          formRef.value.show()
        }
        break
      case 'jobgroup/edit':
        // 编辑
        if (selectRecords.length !== 1) {
          Message.warning('请选择一条记录进行编辑')
          return
        }
        try {
          const response = await requestClient.post('/schedule/jobgroup/get', { id: selectRecords[0].id })
          if (response.success && response.data) {
            const data = response.data
            data.addressType = String(data.addressType)
            if (formRef.value) {
              formRef.value.show(data)
            }
          }
        } catch (error) {
          console.error('查询单个执行器失败:', error)
          Message.error('查询失败')
        }
        break
      case 'jobgroup/del':
        // 删除
        if (selectRecords.length === 0) {
          Message.warning('请选择要删除的记录')
          return
        }
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除选中的${selectRecords.length}个执行器吗？`,
          onOk: async () => {
            try {
              const idList = selectRecords.map((row: any) => row.id)
              const response = await requestClient.post('/schedule/jobgroup/remove', { idList })
              if (response.success) {
                Message.success('删除成功')
                // 刷新表格数据
                params.$grid.commitProxy('query', {})
              }
            } catch (error) {
              console.error('删除失败:', error)
              Message.error('删除失败')
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
} = useList<JobGroupVO>({
  searchFormSchema,
  tableColumns,
  resourceConfig,
  queryFunction,
  gridEvents
});

// 过滤表格操作按钮
const filterColumnHandle = (row: JobGroupVO) => {
  return resourceButtons.value.filter(button => button.cSubArea === 'columnTable');
};

// 处理按钮点击
const toggleToolbarClick = async (button: any, row: JobGroupVO) => {
  const { handle } = button;
  
  switch (handle) {
    case 'jobgroup/edit':
      // 编辑
      try {
        const response = await requestClient.post('/schedule/jobgroup/get', { id: row.id })
        if (response.success && response.data) {
          const data = response.data
          data.addressType = String(data.addressType)
          if (formRef.value) {
            formRef.value.show(data)
          }
        }
      } catch (error) {
        console.error('查询单个执行器失败:', error)
        Message.error('查询失败')
      }
      break;
    case 'jobgroup/del':
      // 删除
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除执行器"${row.title}"吗？`,
        onOk: async () => {
          try {
            const response = await requestClient.post('/schedule/jobgroup/remove', { id: row.id })
            if (response.success) {
              Message.success('删除成功')
              // 刷新表格数据
              gridApi.value?.refresh()
            }
          } catch (error) {
            console.error('删除失败:', error)
            Message.error('删除失败')
          }
        }
      })
      break;
    default:
      break;
  }
};

// 表单保存成功回调
const handleFormSuccess = () => {
  // 刷新表格数据
  gridApi.value?.refresh()
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
    
    <!-- 新增编辑表单 -->
    <JobGroupForm
      ref="formRef"
      v-model:visible="formVisible"
      @success="handleFormSuccess"
    />
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