<script lang="tsx" setup>
import { reactive, ref } from 'vue'
import type { VxeGridProps, VxeGridListeners } from 'vxe-table'
import { Message, Modal } from '@arco-design/web-vue'
import { useSunnyQueryGrid, useSunnyForm, SunnyIcon } from "@sunny-base-web/ui"
import { searchFormSchema, tableColumns } from './config'
import type { DataDictionaryVO } from './types'
import { requestClient } from '@sunny-base-web/effects'
import DataDictionaryAdd from './DataDictionaryAdd.vue'

// ----------------------------------------------------------------------
// 1. Query Form Configuration
// ----------------------------------------------------------------------

const submitting = ref(false)

const [QueryForm, formApi] = useSunnyForm({
  layout: 'vertical',
  size: 'small',
  gridProps: {
    xGap: 16,
    yGap: 0,
    collapsed: true,
    collapsedRows: 1
  },
  showCollapseButton: true,
  showDefaultActions: true,
  submitOnEnter: true,
  submitButtonOptions: { loading: submitting },
  actionColProps: { span: 4 },
  schema: searchFormSchema
})

// ----------------------------------------------------------------------
// 2. Grid Configuration
// ----------------------------------------------------------------------

/**
 * 加载子节点数据
 * @param row - 父节点行数据
 */
async function loadChildren({ row }: { row: DataDictionaryVO & { hasChildren?: boolean } }) {
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

const gridOptions = reactive<VxeGridProps<DataDictionaryVO>>({
  id: 'DataDictionaryQuery',
  border: true,
  size: 'mini',
  showOverflow: true,
  height: 'auto',
  align: 'center',
  rowConfig: {
    keyField: 'id',
    isCurrent: true,
    isHover: true
  },
  checkboxConfig: {
    highlight: true,       // 选中行高亮
    range: true,           // 支持范围选择（Shift+点击）
    reserve: true,         // 跨页保留选中状态
    trigger: 'row',        // 点击行触发选择
    checkStrictly: true    // 父子节点不关联选择
  },
  columnConfig: {
    resizable: true
  },
  pagerConfig: {
    enabled: true,
    size: 'mini',
    pageSize: 20,
    pageSizes: [10, 20, 50, 100]
  },
  toolbarConfig: {
    refresh: true,
    zoom: true,
    custom: true,
    buttons: [
      {
        code: 'add',
        name: '新增',
        icon: 'vxe-icon-add'
      },
      {
        code: 'enable',
        name: '启用',
        icon: 'vxe-icon-check'
      },
      {
        code: 'disable',
        name: '禁用',
        icon: 'vxe-icon-close'
      },
      {
        code: 'delete',
        name: '删除',
        icon: 'vxe-icon-delete'
      }
    ]
  },
  customConfig: {
    mode: 'popup',
    storage: true
  },
  // 树形配置 - 懒加载模式
  treeConfig: {
    lazy: true,              // 开启懒加载
    rowField: 'id',          // 行唯一标识
    hasChild: 'hasChildren', // 标识是否有子节点的字段
    expandAll: false,        // 不默认展开
    loadMethod: loadChildren // 懒加载方法
  },
  proxyConfig: {
    seq: true,
    response: {
      result: 'result.records',
      total: 'result.total'
    },
    ajax: {
      query: async ({ page }) => {
        const formValues = await formApi.getValues()

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
      }
    }
  },
  columns: tableColumns
})

const gridEvents: VxeGridListeners = {
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
  }
}

const [Grid, gridApi] = useSunnyQueryGrid({ gridOptions, gridEvents })

// ----------------------------------------------------------------------
// 3. Form Submit Handler
// ----------------------------------------------------------------------

// 设置表单提交回调，触发表格查询
formApi.setState({
  handleSubmit: async () => {
    submitting.value = true
    try {
      await gridApi.commitProxy('query')
    } catch (error) {
      console.error('查询失败:', error)
      Message.error('查询失败，请重试')
    } finally {
      submitting.value = false
    }
  },
  handleReset: async () => {
    await formApi.resetForm()
    gridApi.commitProxy('query')
  }
})

// 全局回车触发查询
function handleGlobalEnter(e: KeyboardEvent) {
  // 排除多行文本框
  if (e.target instanceof HTMLTextAreaElement) {
    return
  }
  e.preventDefault()
  formApi.submitForm()
}

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
  <div class="data-dictionary-query h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter" tabindex="-1">
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
    </div>

    <!-- Add Form Modal -->
    <DataDictionaryAdd
      v-model:visible="formVisible"
      :parent-id="parentId"
      :parent-name="parentName"
      @success="handleFormSuccess"
    />
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
