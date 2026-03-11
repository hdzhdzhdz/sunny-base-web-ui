import { ref, reactive } from 'vue';
import { useSunnyForm, useSunnyQueryGrid } from '@sunny-base-web/ui';
import type { VxeGridProps, VxeGridListeners } from 'vxe-table';
import { requestClient } from '../api/request';

/**
 * 列表页通用配置
 * @param options 配置选项
 */
export function useList<T>(options: {
  /**
   * 表单配置
   */
  searchFormSchema: any[];
  /**
   * 表格列配置
   */
  tableColumns: any[];
  /**
   * 表格数据类型
   */
  dataType?: new () => T;
  /**
   * 资源配置
   */
  resourceConfig: {
    resourceId: string;
    nResourceid: number;
  };
  /**
   * 表格查询函数
   */
  queryFunction: (params: any) => Promise<any>;
}) {
  const { searchFormSchema, tableColumns, dataType, resourceConfig, queryFunction } = options;

  // ----------------------------------------------------------------------
  // 1. Query Form Configuration
  // ----------------------------------------------------------------------

  const submitting = ref(false);

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
  });

  // ----------------------------------------------------------------------
  // 2. Grid Configuration
  // ----------------------------------------------------------------------

  const gridOptions = reactive<VxeGridProps<T>>({
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
          const formValues = await formApi.getValues();
          return queryFunction({ page, formValues });
        }
      }
    },
    columns: tableColumns
  });

  const gridEvents: VxeGridListeners = {
    // Add grid events if needed
  };

  const [Grid, gridApi] = useSunnyQueryGrid({ gridOptions, gridEvents });

  // ----------------------------------------------------------------------
  // 3. Form Submit Handler
  // ----------------------------------------------------------------------

  // 设置表单提交回调，触发表格查询
  formApi.setState({
    handleSubmit: async () => {
      submitting.value = true;
      try {
        await gridApi.commitProxy('query');
      } finally {
        submitting.value = false;
      }
    },
    handleReset: async () => {
      await formApi.resetForm();
      gridApi.commitProxy('query');
    }
  });

  // 全局回车触发查询
  function handleGlobalEnter(e: KeyboardEvent) {
    // 排除多行文本框
    if (e.target instanceof HTMLTextAreaElement) {
      return;
    }
    e.preventDefault();
    formApi.submitForm();
  }

  // ----------------------------------------------------------------------
  // 4. Search Plan Configuration
  // ----------------------------------------------------------------------

  // 从配置中获取资源信息
  const { resourceId, nResourceid } = resourceConfig;

  // 搜索方案列表
  const searchPlanList = ref([]);

  // 当前选中的搜索方案
  const currentSearchPlan = ref(undefined);

  // 处理查询方案搜索
  const handleSearchPlanSearch = async (formValues) => {
    // 设置表单值
    await formApi.setValues(formValues);
    // 触发表格查询
    await gridApi.commitProxy('query');
  };

  // 处理默认查询方案加载完成
  const handleDefaultPlanLoaded = async (formValues) => {
    // 设置表单值
    await formApi.setValues(formValues);
  };

  return {
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
  };
}

/**
 * 导出 useList 钩子
 */
export default useList;

/**
 * 查询方案 API 实现
 * 所有模块通用的查询方案 API 配置
 */
export const useSearchPlanApi = () => {
  return {
    findAllByResourceid: (data: any) => requestClient.post('/core/assSearchplan/findAllByResourceid', data),
    findSearchPlanColsByPlanId: (data: any) => requestClient.post('/core/assSearchplan/findSearchPlanColsByPlanId', data),
    insert: (data: any) => requestClient.post('/core/assSearchplan/insert', data),
    update: (data: any) => requestClient.post('/core/assSearchplan/update', data),
    del: (data: any) => requestClient.post('/core/assSearchplan/delete', data),
    findDefSearchPlan: (data: any) => requestClient.post('/core/assSearchplan/findDefSearchPlan', data)
  };
};

/**
 * 导出查询方案 API 实例
 */
export const searchPlanApi = useSearchPlanApi();
