<script lang="tsx" setup>
import { reactive, ref } from 'vue'
import type { VxeGridProps, VxeGridListeners } from 'vxe-table'
import { useSunnyQueryGrid, useSunnyForm, SunnySearchPlan } from "@sunny-base-web/ui";
import { Message } from '@arco-design/web-vue';
import { Filter } from "lucide-vue-next";
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
// 4. Search Plan Configuration
// ----------------------------------------------------------------------

// 表单模型
const formModel = ref({});

// 修改表单配置，强制一行三列布局
const modifiedSearchFormSchema = ref(searchFormSchema.map(field => ({
  ...field,
  colProps: {
    span: 8
  }
})));

// 监听表单值变化，同步到formModel
const syncFormModel = () => {
  formModel.value = formApi.getValues();
};

// 搜索方案列表
const searchPlanList = ref([
  {
    ID: 1,
    CSEARCHPLANNAME: '全部日志'
  },
  {
    ID: 2,
    CSEARCHPLANNAME: '成功日志'
  },
  {
    ID: 3,
    CSEARCHPLANNAME: '失败日志'
  }
]);

// 当前选中的搜索方案
const currentSearchPlan = ref(undefined);

// 加载状态
const loading = ref(false);

// 初始化，模拟调用 API 获取查询方案列表
const initSearchPlans = async () => {
  loading.value = true;
  try {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 模拟返回的假数据
    const mockData = [
      {
        ID: 1,
        CSEARCHPLANNAME: '全部日志'
      },
      {
        ID: 2,
        CSEARCHPLANNAME: '成功日志'
      },
      {
        ID: 3,
        CSEARCHPLANNAME: '失败日志'
      }
    ];
    searchPlanList.value = mockData;
  } catch (error) {
    console.error('初始化查询方案列表失败:', error);
    Message.error('初始化查询方案列表失败');
  } finally {
    loading.value = false;
  }
};

// ----------------------------------------------------------------------
// 2. Query Form Configuration
// ----------------------------------------------------------------------

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
  actionColProps: { span: 4 }, // 显式配置操作栏占据 4 列 (1/6)
  schema: searchFormSchema
});

// 调用初始化函数
initSearchPlans();

// 初始化时同步表单模型
syncFormModel();

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

const [Grid, gridApi] = useSunnyQueryGrid({ gridOptions, gridEvents });

// ----------------------------------------------------------------------
// 4. Event Handlers
// ----------------------------------------------------------------------

const handleSearch = () => {
  // 更新 formModel
  syncFormModel();
  gridApi.commitProxy('query');
}

const handleReset = () => {
  formApi.resetValues();
  syncFormModel();
  gridApi.commitProxy('query');
}

// ----------------------------------------------------------------------
// 5. Search Plan Event Handlers
// ----------------------------------------------------------------------

const handleAdd = async (name, formModel) => {
  loading.value = true;
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newPlan = {
      ID: Date.now(),
      CSEARCHPLANNAME: name
    };
    searchPlanList.value.push(newPlan);
    // 自动切换到新查询方案
    currentSearchPlan.value = newPlan;
    Message.success('新增查询方案成功');
  } catch (error) {
    console.error('新增查询方案失败:', error);
    Message.error('新增查询方案失败');
  } finally {
    loading.value = false;
  }
};

const handleUpdate = async (id, name, formModel) => {
  loading.value = true;
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const index = searchPlanList.value.findIndex(item => item.ID === id);
    if (index !== -1) {
      searchPlanList.value[index].CSEARCHPLANNAME = name;
    }
    Message.success('覆盖查询方案成功');
  } catch (error) {
    console.error('覆盖查询方案失败:', error);
    Message.error('覆盖查询方案失败');
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id) => {
  loading.value = true;
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (currentSearchPlan.value && currentSearchPlan.value.ID === id) {
      currentSearchPlan.value = undefined;
    }
    searchPlanList.value = searchPlanList.value.filter(item => item.ID !== id);
    Message.success('删除查询方案成功');
  } catch (error) {
    console.error('删除查询方案失败:', error);
    Message.error('删除查询方案失败');
  } finally {
    loading.value = false;
  }
};

const handleSelect = (plan) => {
  currentSearchPlan.value = plan;
  // 根据选择的方案设置表单值
  let newFormValues;
  if (plan.ID === 1) {
    // 全部日志方案
    newFormValues = {
      username: '',
      operationType: undefined,
      status: undefined,
      timeRange: undefined
    };
  } else if (plan.ID === 2) {
    // 成功日志方案
    newFormValues = {
      username: '',
      operationType: undefined,
      status: 'success',
      timeRange: undefined
    };
  } else if (plan.ID === 3) {
    // 失败日志方案
    newFormValues = {
      username: '',
      operationType: undefined,
      status: 'failure',
      timeRange: undefined
    };
  } else {
    // 自定义方案
    newFormValues = {
      username: '',
      operationType: undefined,
      status: undefined,
      timeRange: undefined
    };
  }
  // 设置表单值
  formApi.setValues(newFormValues);
  // 更新 formModel
  formModel.value = newFormValues;
};

const handleSearchPlanSearch = (formValues) => {
  // 设置表单值
  formApi.setValues(formValues);
  // 更新 formModel
  formModel.value = formValues;
  // 执行搜索
  gridApi.commitProxy('query');
  Message.success('搜索执行成功');
};

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
          <template #expand-before>
            <SunnySearchPlan
                :form-config="modifiedSearchFormSchema"
                :model="formModel"
                :search-plan-list="searchPlanList"
                v-model:current-search-plan="currentSearchPlan"
                :form-props="{
                  layout: 'horizontal',
                  size: 'small',
                  labelWidth: 80,
                  gridProps: {
                    xGap: 16,
                    yGap: 0,
                    collapsed: true,
                    collapsedRows: 1
                  },
                  showCollapseButton: true,
                  actionColProps: { span: 8 }
                }"
                :loading="loading"
                @add="handleAdd"
                @update="handleUpdate"
                @delete="handleDelete"
                @select="handleSelect"
                @search="handleSearchPlanSearch"
              >
              <template #trigger="{ open }">
                <button
                  type="button"
                  class="arco-btn arco-btn-outline arco-btn-sm mr-2"
                  @click="open"
                  title="查询方案"
                >
                  <Filter class="w-4 h-4" />
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
  </div>
</template>

<style scoped>
:deep(.arco-form-item) {
  margin-bottom: 0;
}
</style>
