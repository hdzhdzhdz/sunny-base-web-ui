<script lang="tsx" setup>
import { ref } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { searchFormSchema, tableColumns, resourceConfig } from './config'
import type { OtherPermissionsVO } from './types'
import { requestClient, useList } from '@sunny-base-web/effects'
import OtherPermissionsAdd from './OtherPermissionsAdd.vue'
import OtherPermissionsUpdate from './OtherPermissionsUpdate.vue'

// 表格查询函数
const queryFunction = async ({ page, formValues }) => {
  const queryParams = {
    pageNo: page.currentPage,
    pageSize: page.pageSize,
    authExres: {
      ...formValues,
      nType: 0  // 首次只查根节点
    }
  }

  const response = await requestClient.post('/core/authExres/selectForPage', queryParams)
  // 给每条记录添加 hasChildren 标识，让所有节点都可展开
  if (response.result?.records) {
    response.result.records = response.result.records.map((item: OtherPermissionsVO) => ({
      ...item,
      hasChildren: true
    }))
  }
  return response
};

/**
 * 加载子节点数据
 * @param row - 父节点行数据
 */
async function loadChildren({ row }: { row: OtherPermissionsVO & { hasChildren?: boolean } }) {
  const formValues = await formApi.getValues()

  const queryParams = {
    authExres: {
      cExresparnum: row.cExresnum  // 查询该节点的子节点
    }
  }

  try {
    const response = await requestClient.post<{ result: { records: OtherPermissionsVO[] } }>('/core/authExres/queryChildList', queryParams)
    const authExresList = response.result?.authExresList || []
    // 给每条记录添加 hasChildren 标识，支持继续展开
    return authExresList.map(item => ({
      ...item
    }))
  } catch (error) {
    console.error('加载子节点失败:', error)
    return []
  }
}

// 树形配置
const treeConfig = {
  lazy: true,              // 开启懒加载
  rowField: 'id',          // 行唯一标识
  hasChild: 'hasChildren', // 标识是否有子节点的字段
  expandAll: false,        // 不默认展开
  loadMethod: loadChildren // 懒加载方法
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
} = useList<OtherPermissionsVO>({
  searchFormSchema,
  tableColumns,
  resourceConfig,
  queryFunction,
  gridEvents: {
    toolbarButtonClick: ({ code }: { code: string }) => {
      if (code === 'otherPermissions/add') {
        handleAdd()
      } else if (code === 'otherPermissions/update') {
        handleUpdate()
      } else if (code === 'otherPermissions/enable') {
        handleSign('10001')
      } else if (code === 'otherPermissions/disable') {
        handleSign('10002')
      } else if (code === 'otherPermissions/del') {
        handleDelete()
      }
    }
  },
  treeConfig: treeConfig,
  lazy: true
});

// 打开新增弹窗
function handleAdd() {
  const selectedRows = gridApi.getSelection() as OtherPermissionsVO[]
  if (selectedRows.length > 1) {
    Message.warning('最多只能选择一条数据作为父级')
    return
  }

  if (selectedRows.length === 1) {
    // 将选中行的cExresnum和id传递到表单中
    cExresnum.value = selectedRows[0].cExresnum
    id.value = selectedRows[0].id
  } else {
    cExresnum.value = ''
    id.value = ''
  }

  formVisible.value = true
}

// 打开修改弹窗
function handleUpdate() {
  const selectedRows = gridApi.getSelection() as OtherPermissionsVO[]
  if (selectedRows.length !== 1) {
    Message.warning('请选择一条数据进行修改')
    return
  }

  const row = selectedRows[0]
  selectedRow.value = row
  updateVisible.value = true
}

// 启用/禁用
async function handleSign(cSign: string) {
  const selectedRows = gridApi.getSelection() as OtherPermissionsVO[]

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
    const res = await requestClient.post<{ message?: string }>('/core/authExres/sign', {
      authExres: {
        id: row.id,
        cSign
      }
    })
    Message.success(res.message || `${actionText}成功`)
    gridApi.commitProxy('query')
  } catch (error: any) {
    console.error(`${actionText}失败:`, error)
  }
}

// 删除选中行
function handleDelete() {
  const selectedRows = gridApi.getSelection() as OtherPermissionsVO[]

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
    content: `确定要删除「${row.cExresname}」吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await requestClient.post<{ message?: string }>('/core/authExres/delete', {
          authExres: {
            id: row.id
          }
        })
        Message.success(res.message || '删除成功')
        gridApi.commitProxy('query')
      } catch (error: any) {
        console.error('删除失败:', error)
      }
    }
  })
}

// 新增成功后刷新表格
function handleFormSuccess() {
  gridApi.commitProxy('query')
}

// 表单相关
const formVisible = ref(false)
const parentId = ref('0')
const parentName = ref('')
const cExresnum = ref('')
const id = ref('')

// 修改表单相关
const updateVisible = ref(false)
const selectedRow = ref(null)
</script>

<template>
  <div class="other-permissions-query h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter"
    tabindex="-1">
    <!-- Main Container -->
    <div
      class="flex-1 bg-[var(--color-bg-2)] flex flex-col shadow-sm border border-[var(--color-border)] overflow-hidden rounded">
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
    <OtherPermissionsAdd v-model:visible="formVisible" :parent-id="parentId" :parent-name="parentName"
      :c-exresnum="cExresnum" :id="id" @success="handleFormSuccess" />

    <!-- Update Form Modal -->
    <OtherPermissionsUpdate v-model:visible="updateVisible" :row="selectedRow" @success="handleFormSuccess" />
  </div>
</template>

<style scoped>
:deep(.arco-form-item) {
  margin-bottom: 0;
}

.other-permissions-query {
  outline: none;
}
</style>