<script lang="tsx" setup>
import { reactive, ref } from 'vue'
import type { VxeGridProps, VxeGridListeners } from 'vxe-table'
import { useSunnyQueryGrid, useSunnyForm,SunnySearchPlan } from "@sunny-base-web/ui"
import { searchFormSchema, tableColumns } from './config'
import type { OperationLogVO } from './types'
import { requestClient } from '@sunny-base-web/effects'
import { Filter } from "lucide-vue-next";


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

const gridOptions = reactive<VxeGridProps<OperationLogVO>>({
  id: 'OperationLogQuery',
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
  toolbarConfig: {
    refresh: true,
    zoom: true,
    custom: true
  },
  customConfig: {
    mode: 'popup',
    storage: true
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
          assUserOperationLog: {
            dCreatelist: formValues.dCreatelist || [],
            cModname: formValues.cModname || '',
            cSystem: formValues.cSystem || '',
            cDanju: formValues.cDanju || '',
            cUser: formValues.cUser || ''
          }
        }

        return requestClient.post('/core/assUserOperationLog/selectForPage', queryParams)
      }
    }
  },
  columns: tableColumns
})

const gridEvents: VxeGridListeners = {
  // Add grid events if needed
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


// 调用初始化函数
initSearchPlans();

// 初始化时同步表单模型
syncFormModel();

</script>

<template>
  <div class="operation-log-query h-full flex flex-col bg-[var(--color-fill-2)]" @keydown.enter="handleGlobalEnter" tabindex="-1">
    <!-- Main Container -->
    <div
      class="flex-1 bg-[var(--color-bg-2)] flex flex-col shadow-sm border border-[var(--color-border)] overflow-hidden rounded"
    >
      <!-- Search Form Area -->
      <div class="px-4 border-b py-2 pb-3 border-[var(--color-border)]">
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

.operation-log-query {
  outline: none;
}
</style>
