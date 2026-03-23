import { ref, reactive, onMounted } from 'vue';
import { useSunnyForm, useSunnyQueryGrid } from '@sunny-base-web/ui';
import type { VxeGridProps, VxeGridListeners } from 'vxe-table';
import { requestClient } from '../api/request';
import { getResourceByParIdOrModnumb } from '../api/resource';
import { initResourceConstructor } from '../utils/utils';
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
  tableColumns: VxeGridProps['columns'];
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
    /**
     * 模块编号
     */
    cModnumb?: string;
  };
  /**
   * 表格查询函数
   */
  queryFunction: (params: any) => Promise<any>;
  /**
   * 表格事件配置
   */
  gridEvents?: any;
  /**
   * 树形配置
   */
  treeConfig?: any;
  /**
   * 树形表格懒加载方法
   */
  loadMethod?: (row: any) => Promise<any[]>;
  /**
   * 对象转值字段列表
   * 用于将 BusinessSearch 等返回的对象数组转换为值字符串
   */
  objectToValueFields?: string[];
  /**
   * 是否开启懒加载
   */
  lazy?: boolean;
}) {
  const { searchFormSchema, tableColumns, dataType, resourceConfig, queryFunction, gridEvents, treeConfig, loadMethod, objectToValueFields, lazy } = options;

  // ----------------------------------------------------------------------
  // 1. Query Form Configuration
  // ----------------------------------------------------------------------

  const submitting = ref(false);

  const [QueryForm, formApi] = useSunnyForm({
    layout: 'vertical',
    size: 'small',
    gridProps: {
      xGap: 8,
      yGap: 8,
      collapsed: true,
      collapsedRows: 1
    },
    showCollapseButton: true,
    showDefaultActions: true,
    submitOnEnter: true,
    submitButtonOptions: { loading: submitting },
    actionColProps: { span: 4 },
    schema: searchFormSchema,
    objectToValueFields
  });

  // ----------------------------------------------------------------------
  // 2. Grid Configuration
  // ----------------------------------------------------------------------

  const gridOptions = reactive<VxeGridProps<T>>({
    id: 'OperationLogQuery',
    border: true,
    size: 'mini',
    showOverflow: true,
    stripe: !treeConfig && !lazy,
    height: 'auto',
    align: 'center',
    rowConfig: {
      keyField: 'id',
      isCurrent: true,
      isHover: true
    },
    checkboxConfig: {
      highlight: true,       // 选中行高亮
      range: !treeConfig && !lazy,           // 支持范围选择（Shift+点击），树形结构不支持
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
      custom: true
    },
    customConfig: {
      mode: 'popup',
      storage: true
    },
    // 树形配置
    ...(treeConfig && {
      treeConfig: {
        ...treeConfig,
        lazy: treeConfig.lazy !== undefined ? treeConfig.lazy : lazy,              // 开启懒加载
        rowField: treeConfig.rowField || 'id',          // 行唯一标识
        hasChild: treeConfig.hasChild || 'hasChildren', // 标识是否有子节点的字段
        expandAll: treeConfig.expandAll || false,        // 不默认展开
        loadMethod: treeConfig.loadMethod || (loadMethod ? (row: any, resolve: (data: any[]) => void) => {
          loadMethod(row).then(resolve).catch(() => resolve([]))
        } : undefined)    // 包装loadMethod以适配vxe-table的回调风格
      }
    }),

    proxyConfig: {
      seq: true,
      response: {
        result: 'result.records',
        total: 'result.total'
      },
      ajax: {
        query: async ({ page }, filterValues) => {
          const formValues = await formApi.getValues();
          return queryFunction({ page, formValues, filterValues });
        }
      }
    },
    columns: tableColumns
  });

  const [Grid, gridApi] = useSunnyQueryGrid({ gridOptions, gridEvents: gridEvents || {} });

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
  const { resourceId, nResourceid, cModnumb } = resourceConfig;

  // 搜索方案列表
  const searchPlanList = ref([]);

  // 当前选中的搜索方案
  const currentSearchPlan = ref(undefined);

  // 资源按钮列表
  const resourceButtons = ref<any[]>([]);

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

  // 获取资源配置
  const fetchResourceConfig = async () => {
    if (!cModnumb) {
      console.warn('[useList] 未配置 cModnumb，跳过资源获取');
      return;
    }

    try {
      const res = await getResourceByParIdOrModnumb({ modnumb: cModnumb });
      if (res.code === 200 && res.result) {
        const { resButtonList } = initResourceConstructor(res.result);
        // 更新资源按钮列表 - 获取searchTable下所有按钮，不过滤cSubArea
        resourceButtons.value = resButtonList?.searchTable || [];
        // 更新表格按钮配置 - 只使用cSubArea为空的按钮
        const toolbarButtons = resourceButtons.value.filter(button => !button.cSubArea);
        if (toolbarButtons.length > 0) {
          gridOptions.toolbarConfig = {
            ...gridOptions.toolbarConfig,
            buttons: toolbarButtons
          };
        }
      }
    } catch (error) {
      console.error('[useList] 获取资源配置失败:', error);
    }
  };

  // 组件挂载时获取资源配置
  onMounted(() => {
    fetchResourceConfig();
  });

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
    resourceButtons,
    handleSearchPlanSearch,
    handleDefaultPlanLoaded,
    fetchResourceConfig
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
