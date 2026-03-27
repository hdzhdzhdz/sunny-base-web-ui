<script lang="tsx" setup>
import { SunnySearchPlan, SunnyIcon } from "@sunny-base-web/ui"
import { getJobInfoConfig, resourceConfig } from './config'
import type { JobInfoVO } from './types'
import { requestClient, useList } from '@sunny-base-web/effects'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { Modal, Message } from '@arco-design/web-vue'
import JobInfoForm from './JobInfoForm.vue'
import JobInfoOnce from './JobInfoOnce.vue'
import JobInfoCode from './JobInfoCode.vue'
const { t } = useI18n()

const { searchFormSchema, tableColumns } = getJobInfoConfig({ t })

// 组件引用和状态
const formVisible = ref(false)
const onceVisible = ref(false)
const codeVisible = ref(false)
const formRef = ref<InstanceType<typeof JobInfoForm> | null>(null)
const onceRef = ref<InstanceType<typeof JobInfoOnce> | null>(null)
const codeRef = ref<InstanceType<typeof JobInfoCode> | null>(null)

// ----------------------------------------------------------------------
// 1. List Configuration
// ----------------------------------------------------------------------

// 表格查询函数
const queryFunction = async ({ page, formValues }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    jobInfo: formValues
  };
  return requestClient.post('/schedule/jobinfo/selectForPage', queryParams);
};

// 表格事件
const gridEvents = {
  async toolbarButtonClick(params: any) {
    switch (params.button.code) {
      case 'jobinfo/add':
        // 新增
        if (formRef.value) {
          formRef.value.show()
        }
        break
      default:
        break
    }
  }
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
} = useList<JobInfoVO>({
  searchFormSchema,
  tableColumns,
  resourceConfig,
  queryFunction,
  gridEvents
});

// 过滤表格操作按钮
const filterColumnHandle = (row: JobInfoVO) => {
  return resourceButtons.value.filter(button => button.cSubArea === 'columnTable');
};

// 处理按钮点击
const toggleToolbarClick = async (button: any, row: JobInfoVO) => {
  const { handle } = button;
  
  switch (handle) {
    case 'jobinfo/once':
      // 执行一次
      if (onceRef.value) {
        onceRef.value.show(row)
      }
      break;
    case 'jobinfo/start':
      // 启动
      Modal.confirm({
        title: t('jobinfo.confirmStart'),
        content: t('jobinfo.confirmStartContent', { jobDesc: row.jobDesc }),
        onOk: async () => {
          try {
            const response = await requestClient.post('/schedule/jobinfo/start', { id: row.id })
            if (response.success) {
              Message.success(t('jobinfo.startSuccess'))
              // 刷新表格数据
              gridApi.value?.refresh()
            }
          } catch (error) {
            console.error('启动失败:', error)
            Message.error(t('jobinfo.startFailed'))
          }
        }
      })
      break;
    case 'jobinfo/stop':
      // 停止
      Modal.confirm({
        title: t('jobinfo.confirmStop'),
        content: t('jobinfo.confirmStopContent', { jobDesc: row.jobDesc }),
        onOk: async () => {
          try {
            const response = await requestClient.post('/schedule/jobinfo/stop', { id: row.id })
            if (response.success) {
              Message.success(t('jobinfo.stopSuccess'))
              // 刷新表格数据
              gridApi.value?.refresh()
            }
          } catch (error) {
            console.error('停止失败:', error)
            Message.error(t('jobinfo.stopFailed'))
          }
        }
      })
      break;
    case 'jobinfo/del':
      // 删除
      Modal.confirm({
        title: t('jobinfo.confirmDelete'),
        content: t('jobinfo.confirmDeleteContent', { jobDesc: row.jobDesc }),
        onOk: async () => {
          try {
            const response = await requestClient.post('/schedule/jobinfo/remove', { id: row.id })
            if (response.success) {
              Message.success(t('jobinfo.deleteSuccess'))
              // 刷新表格数据
              gridApi.value?.refresh()
            }
          } catch (error) {
            console.error('删除失败:', error)
            Message.error(t('jobinfo.deleteFailed'))
          }
        }
      })
      break;
    case 'jobinfo/copy':
      // 复制
      try {
        const response = await requestClient.post('/schedule/jobinfo/get', { id: row.id })
        if (response.success && response.data) {
          const data = response.data
          data.id = '' // 清空ID，作为新增
          if (formRef.value) {
            formRef.value.show(data)
          }
        }
      } catch (error) {
        console.error('复制失败:', error)
        Message.error(t('jobinfo.copyFailed'))
      }
      break;
    case 'jobinfo/edit':
      // 编辑
      try {
        const response = await requestClient.post('/schedule/jobinfo/get', { id: row.id })
        if (response.success && response.data) {
          if (formRef.value) {
            formRef.value.show(response.data)
          }
        }
      } catch (error) {
        console.error('编辑失败:', error)
        Message.error(t('jobinfo.editFailed'))
      }
      break;
    case 'jobinfo/ide':
      // GLUE IDE
      if (codeRef.value) {
        codeRef.value.show(row)
      }
      break;
    case 'jobinfo/zcjd':
      // 注册节点
      try {
        const response = await requestClient.post('/schedule/jobinfo/findJobGroup', { id: row.jobGroup })
        if (response.success && response.data) {
          const mine = response.data[0]
          Modal.info({
            title: t('jobinfo.registerNodeInfo'),
            content: `<div>
              <strong>${t('jobinfo.appName')}：</strong>${mine.appname}<br/>
              <strong>${t('jobinfo.title')}：</strong>${mine.title}<br/>
              <strong>${t('jobinfo.registerType')}：</strong>${mine.addressType === '0' ? t('jobinfo.autoRegister') : t('jobinfo.manualEntry')}<br/>
              <strong>${t('jobinfo.onlineAddress')}：</strong>${mine.addressList || ''}<br/>
            </div>`,
            dangerouslyUseHTMLString: true
          })
        }
      } catch (error) {
        console.error('查询注册节点失败:', error)
        Message.error(t('jobinfo.queryFailed'))
      }
      break;
    case 'jobinfo/rizhi':
      // 查询日志
      // 跳转到日志页面
      window.location.href = `/setting/dsrw/joblog?jobGroup=${row.jobGroup}&jobDesc=${encodeURIComponent(row.jobDesc)}`
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
  <div class="job-info-query h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter" tabindex="-1">
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
    
    <!-- 新增编辑弹窗 -->
    <JobInfoForm
      ref="formRef"
      :visible="formVisible"
      @update:visible="formVisible = $event"
      @success="handleFormSuccess"
    />
    
    <!-- 执行一次弹窗 -->
    <JobInfoOnce
      ref="onceRef"
      :visible="onceVisible"
      @update:visible="onceVisible = $event"
      @success="handleFormSuccess"
    />
    
    <!-- IDE代码编辑器弹窗 -->
    <JobInfoCode
      ref="codeRef"
      :visible="codeVisible"
      @update:visible="codeVisible = $event"
      @success="handleFormSuccess"
    />
  </div>
</template>

<style scoped>
:deep(.arco-form-item) {
  margin-bottom: 0;
}

.job-info-query {
  outline: none;
}
</style>