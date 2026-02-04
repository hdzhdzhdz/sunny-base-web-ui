<script lang="tsx" setup>
import { reactive } from 'vue'
import type { VxeGridProps, VxeGridListeners } from 'vxe-table'
import { useKunkkaQueryGrid, useKunkkaForm } from "@kunkka/ui";
import { Message } from '@arco-design/web-vue';
import { searchFormSchema, tableColumns } from './config';
import type { OperationLogVO } from './types';

// ----------------------------------------------------------------------
// 1. Mock Data & Types
// ----------------------------------------------------------------------

// 模拟查询接口
const fetchApi = (page: { currentPage: number, pageSize: number }, queryParams?: any) => {
  return new Promise<{ page: { total: number }, result: OperationLogVO[] }>(resolve => {
    const { currentPage, pageSize } = page
    console.log('Fetching logs with params:', queryParams)
    
    setTimeout(() => {
      const list: OperationLogVO[] = Array.from({ length: 100 }, (_, i) => {
        const id = i + 1 + (currentPage - 1) * pageSize;
        const status = Math.random() > 0.2 ? 'success' : 'failure';
        const operations = ['Create', 'Update', 'Delete', 'Login', 'Export', 'Import'];
        const modules = ['User Management', 'System Settings', 'Role Management', 'Menu Management'];
        
        return {
          id: `${id}`,
          username: `user_${id}`,
          module: modules[Math.floor(Math.random() * modules.length)],
          operationType: operations[Math.floor(Math.random() * operations.length)],
          description: `Executed operation ${id}`,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          status: status as 'success' | 'failure',
          createTime: new Date().toISOString(),
          duration: Math.floor(Math.random() * 1000)
        }
      })

      // Simple frontend filtering for mock
      let filteredList = list;
      if (queryParams?.username) {
        filteredList = filteredList.filter(item => item.username.includes(queryParams.username));
      }
      if (queryParams?.operationType) {
        filteredList = filteredList.filter(item => item.operationType === queryParams.operationType);
      }
      if (queryParams?.status) {
        filteredList = filteredList.filter(item => item.status === queryParams.status);
      }

      resolve({
        page: {
          total: 1000 // Mock total
        },
        result: filteredList
      })
    }, 500)
  })
}

// ----------------------------------------------------------------------
// 2. Query Form Configuration
// ----------------------------------------------------------------------

const [QueryForm, formApi] = useKunkkaForm({
  layout: 'vertical',
  size: 'small',
  gridProps: { 
    xGap: 16, 
    yGap: 0, 
    collapsed: true, 
    collapsedRows: 1 
  },
  showCollapseButton: true,
  actionColProps: { span: 4 }, // 显式配置操作栏占据 4 列 (1/6)
  schema: searchFormSchema
});

// ----------------------------------------------------------------------
// 3. Grid Configuration
// ----------------------------------------------------------------------

const gridOptions = reactive<VxeGridProps<OperationLogVO>>({
  border: true,
  size: 'mini',
  showOverflow: true,
  height: 'auto',
  align: 'center',
  columnConfig: {
    resizable: true
  },
  pagerConfig: {
    enabled: true,
    size: 'mini',
    pageSize: 20,
    pageSizes: [10, 20, 50, 100]
  },
  // toolbarConfig: {
  //   refresh: true,
  //   zoom: true,
  //   custom: true,
  //   slots: {
  //     buttons: 'toolbar_buttons'
  //   }
  // },
  proxyConfig: {
    seq: true, // Enable auto sequence number
    props: {
      result: 'result',
      total: 'page.total'
    },
    ajax: {
      query: ({ page }) => {
        // Get form values
        const formValues = formApi.getValues();
        return fetchApi(page, formValues);
      }
    }
  },
  columns: tableColumns
})

const gridEvents: VxeGridListeners = {
  // Add grid events if needed
}

const [Grid, gridApi] = useKunkkaQueryGrid({ gridOptions, gridEvents });

// ----------------------------------------------------------------------
// 4. Event Handlers
// ----------------------------------------------------------------------

const handleSearch = () => {
  gridApi.commitProxy('query');
}

const handleReset = () => {
  formApi.resetValues();
  gridApi.commitProxy('query');
}

</script>

<template>
  <div class="h-full flex flex-col bg-[var(--color-fill-2)]">
    <!-- Main Container -->
    <div 
      class="flex-1 bg-[var(--color-bg-2)] flex flex-col shadow-sm border border-[var(--color-border)] overflow-hidden rounded"
    >
      <!-- Search Form Area -->
      <div class="px-4  border-b py-2 pb-3 border-[var(--color-border)]">
        <QueryForm>
    
        </QueryForm>
      </div>

      <!-- Data Grid Area -->
      <div class="flex-1 px-2 pt-1 overflow-hidden flex flex-col">
        <Grid class="flex-1" />
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.arco-form-item) {
  margin-bottom: 0;
}
</style>
