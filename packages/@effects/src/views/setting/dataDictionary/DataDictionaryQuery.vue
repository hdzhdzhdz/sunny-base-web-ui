<script lang="tsx" setup>
import { ref } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { SunnySearchPlan, SunnyIcon } from '@sunny-base-web/ui'
import { searchPlanApi, useList } from '../../../hooks/useList'
import { searchFormSchema, tableColumns, resourceConfig } from './config'
import type { DataDictionaryVO } from './types'
import { requestClient } from '../../../api/request'
import DataDictionaryAdd from './DataDictionaryAdd.vue'

// ----------------------------------------------------------------------
// 1. List Configuration
// ----------------------------------------------------------------------



// 表格查询函数
const queryFunction = async ({ page, formValues }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    authDict: {
      cSign: formValues.cSign || '',
      cXuhao: formValues.cXuhao || '',
      cName: formValues.cName || '',
      nParent: 0  // 首次只查根节点
    }
  }

  const response = await requestClient.post('/core/authDict/selectForPage', queryParams)
  // 给每条记录添加 hasChildren 标识，让所有节点都可展开
  if (response.result?.records) {
    response.result.records = response.result.records.map((item: DataDictionaryVO) => ({
      ...item,
      hasChildren: true
    }))
  }
  return response
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
} = useList<DataDictionaryVO>({
  searchFormSchema,
  tableColumns,
  resourceConfig,
  queryFunction,
  gridEvents: {
    toolbarButtonClick: ({ code }: { code: string }) => {
      if (code === 'add') {
        handleAdd()
      } else if (code === 'enable') {
        handleSign('10001')
      } else if (code === 'disable') {
        handleSign('10002')
      } else if (code === 'delete') {
        handleDelete()
      }
    },
    // 树形表格懒加载
    treeNodeExpand: async ({ row }: { row: DataDictionaryVO & { hasChildren?: boolean } }) => {
      const formValues = await formApi.getValues()

      const queryParams = {
        pageNo: 1,
        pageSize: 9999,
        authDict: {
          cSign: formValues.cSign || '',
          cXuhao: formValues.cXuhao || '',
          cName: formValues.cName || '',
          nParent: row.id  // 查询该节点的子节点
        }
      }

      try {
        const response = await requestClient.post<{ result: { records: DataDictionaryVO[] } }>('/core/authDict/selectForPage', queryParams)
        const records = response.result?.records || []
        // 给每条记录添加 hasChildren 标识，支持继续展开
        return records.map(item => ({
          ...item,
          hasChildren: true
        }))
      } catch (error) {
        console.error('加载子节点失败:', error)
        return []
      }
    }
  }
});

// ----------------------------------------------------------------------
// 4. Add Form Handler
// ----------------------------------------------------------------------

const formVisible = ref(false)
const parentId = ref('0')
const parentName = ref('')

// 打开新增弹窗
function handleAdd() {
  const selectedRows = gridApi.getSelection() as DataDictionaryVO[]
  if (selectedRows.length > 1) {
    Message.warning('最多只能选择一条数据作为父级')
    return
  }

  if (selectedRows.length === 1) {
    parentId.value = selectedRows[0].id
    parentName.value = selectedRows[0].cName
  } else {
    parentId.value = '0'
    parentName.value = ''
  }

  formVisible.value = true
}

// ----------------------------------------------------------------------
// 5. Sign Handler (Enable/Disable)
// ----------------------------------------------------------------------

// 启用/禁用
async function handleSign(cSign: string) {
  const selectedRows = gridApi.getSelection() as DataDictionaryVO[]

  if (selectedRows.length === 0) {
    Message.warning('请选择要操作的数据')
    return
  }

  if (selectedRows.length > 1) {
    Message.warning('一次只能操作一条数据')
    return
  }

  const row = selectedRows[0]
  const actionText = cSign === '10001' ? '启用' : '禁用'

  try {
    const res = await requestClient.post<{ message?: string }>('/core/authDict/sign', {
      authDict: {
        id: row.id,
        cSign
      }
    })
    Message.success(res.message || `${actionText}成功`)
    gridApi.commitProxy('query')
  } catch (error: any) {
    console.error(`${actionText}失败:`, error)
    // 错误消息由拦截器统一处理
  }
}

// ----------------------------------------------------------------------
// 6. Delete Handler
// ----------------------------------------------------------------------

// 删除选中行
function handleDelete() {
  const selectedRows = gridApi.getSelection() as DataDictionaryVO[]

  if (selectedRows.length === 0) {
    Message.warning('请选择要删除的数据')
    return
  }

  if (selectedRows.length > 1) {
    Message.warning('一次只能删除一条数据')
    return
  }

  const row = selectedRows[0]

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除「${row.cName}」吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await requestClient.post<{ message?: string }>('/core/authDict/delete', {
          authDict: {
            id: row.id
          }
        })
        Message.success(res.message || '删除成功')
        gridApi.commitProxy('query')
      } catch (error: any) {
        console.error('删除失败:', error)
        // 错误消息由拦截器统一处理
      }
    }
  })
}

// ----------------------------------------------------------------------
// 7. Form Success Handler
// ----------------------------------------------------------------------

// 新增成功后刷新表格
function handleFormSuccess() {
  gridApi.commitProxy('query')
}

</script>

<template>
  <div class="data-dictionary-query h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter"
    tabindex="-1">
    <!-- Main Container -->
    <div
      class="flex-1 bg-[var(--color-bg-2)] flex flex-col shadow-sm border border-[var(--color-border)] overflow-hidden rounded">
      <!-- Search Form Area -->
      <div class="px-4 border-b py-2 pb-3 border-[var(--color-border)]">
        <QueryForm>
          <template #expand-before>
            <SunnySearchPlan :form-config="searchFormSchema" v-model:current-search-plan="currentSearchPlan"
              v-model:search-plan-list="searchPlanList" :resource-id="resourceId" :n-resourceid="nResourceid"
              :api="searchPlanApi" @search="handleSearchPlanSearch" @default-plan-loaded="handleDefaultPlanLoaded">
              <template #trigger="{ open }">
                <button type="button"
                  class="px-3 py-1.5 border border-[var(--color-border-2)] rounded bg-white text-sm transition-all hover:border-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-6))] disabled:cursor-not-allowed disabled:opacity-60 mr-2"
                  @click="open" title="查询方案">
                  <SunnyIcon icon="lucide:filter" class="w-4 h-4" />
                </button>
              </template>
            </SunnySearchPlan>
          </template>
        </QueryForm>
      </div>

      <!-- Data Grid Area -->
      <div class="flex-1 px-2 pt-1 overflow-hidden flex flex-col">
        <Grid class="flex-1" />
      </div>
    </div>

    <!-- Add Form Modal -->
    <DataDictionaryAdd v-model:visible="formVisible" :parent-id="parentId" :parent-name="parentName"
      @success="handleFormSuccess" />
  </div>
</template>

<style scoped>
:deep(.arco-form-item) {
  margin-bottom: 0;
}

.data-dictionary-query {
  outline: none;
}
</style>
