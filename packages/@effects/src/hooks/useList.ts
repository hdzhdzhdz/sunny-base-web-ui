import { ref, reactive, onMounted, watch } from 'vue';
import { useSunnyForm, useSunnyQueryGrid } from '@sunny-base-web/ui';
import { requestClient } from '../api/request';
import { getResourceByParIdOrModnumb } from '../api/resource';
import { initResourceConstructor } from '../utils/utils';
import { useSchemaOptionsLoader } from '../utils/use-schema-options-loader';
import { useSchemaPermissionLoader } from '../utils/use-schema-permission-loader';
import { applyAutoSelectDefaults } from '../utils/apply-auto-select-defaults';

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
   * 表单字段映射到时间格式
   */
  fieldMappingTime?: any[];
  /**
   * 表单字段数组映射字符串配置
   */
  arrayToStringFields?: any[];
  /**
   * 是否开启懒加载
   */
  lazy?: boolean;
  /**
   * 是否自动加载数据
   */
  autoLoad?: boolean;
  /**
   * 是否显示全选 checkbox 列
   * @default false
   */
  showCheckbox?: boolean;
  /**
   * 聚合配置（用于行分组等场景）
   */
  aggregateConfig?: { groupFields?: string[]; [key: string]: any };

}) {
  const { searchFormSchema, tableColumns, dataType, resourceConfig, queryFunction, gridEvents, treeConfig, loadMethod, objectToValueFields, fieldMappingTime, arrayToStringFields, lazy, autoLoad = true, showCheckbox = true, aggregateConfig } = options;

  // ----------------------------------------------------------------------
  // 1. Basic Configuration
  // ----------------------------------------------------------------------

  // 从配置中获取资源信息
  const { resourceId, nResourceid, cModnumb } = resourceConfig;

  // 搜索方案列表
  const searchPlanList = ref([]);

  // 当前选中的搜索方案
  const currentSearchPlan = ref(undefined);

  // ----------------------------------------------------------------------
  // 2. Query Form Configuration
  // ----------------------------------------------------------------------

  const submitting = ref(false);

  // 使用声明式加载选项处理搜索表单
  const { enhancedSchema: dictEnhancedSchema } = useSchemaOptionsLoader(searchFormSchema);
  
  // 使用声明式加载权限选项（在字典增强后的 Schema 上再增强）
  let _formApi: any;
  const { enhancedSchema: permissionEnhancedSchema } = useSchemaPermissionLoader(dictEnhancedSchema, {
    onAutoSelect: (defaults) => applyAutoSelectDefaults(defaults, _formApi),
  });

  // 创建表单，不包含searchPlanConfig
  const [QueryForm, formApi] = useSunnyForm({
    layout: 'vertical',
    size: 'mini',
    gridProps: {
      xGap: 8,
      yGap: 8,
      collapsedRows: 1
    },
    // 查询表单响应式栅格配置
    // xs/sm/md (< 992px): 单列布局 - 每行 1 个字段 (span: 24)
    // lg (>= 992px): 四列布局 - 每行 4 个字段 (span: 6)
    // xl/xxl (>= 1200px): 六列布局 - 每行 6 个字段 (span: 4)
    commonConfig: {
      colProps: { span: 24, lg: 6, xl: 4 },
    },
    collapsed: true,
    showCollapseButton: true,
    showDefaultActions: true,
    submitOnEnter: true,
    submitButtonOptions: { loading: submitting },
    actionColProps: { span: 24, lg: 6, xl: 4 },
    schema: permissionEnhancedSchema.value,
    objectToValueFields,
    fieldMappingTime,
    arrayToStringFields
  });

  _formApi = formApi;

  // ----------------------------------------------------------------------
  // 3. Grid Configuration
  // ----------------------------------------------------------------------

  const gridOptions = reactive<any>({
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
    ...(showCheckbox && {
      checkboxConfig: {
        highlight: true,       // 选中行高亮
        range: !treeConfig && !lazy,           // 支持范围选择（Shift+点击），树形结构不支持
        reserve: true,         // 跨页保留选中状态
        trigger: 'row',        // 点击行触发选择
        checkStrictly: !!(treeConfig || lazy)    // 仅树形/懒加载时父子不关联，否则会隐藏表头全选框
      },
    }),
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
      storage: true,
      showSortPutButton: true
    },
    // 显示选择数量，需配合 toolbarConfig 和 checkboxConfig 使用
    showSelectionCount: true,
    // 表格说明，鼠标悬停 ! 按钮时显示
    gridTip: '1. 支持跨页选择，注意清空选中项\n2. 表格支持本地(换电脑清空)列配置，退出登录不清空\n3. 支持服务端排序\n4. 支持鼠标区域选取，Ctrl+A 全选\n5. 支持 Ctrl+C 复制选中区域\n6. 支持 Tab/方向键/Shift+方向键导航\n',
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
    // 聚合配置（行分组等）
    ...(aggregateConfig && { aggregateConfig }),
    // 使用服务端排序，排序信息通过 sorts 参数传给 queryFunction
    sortConfig: {
      remote: true
    },
    filterConfig: {
      remote: false
    },
    columns: showCheckbox
      ? tableColumns
      : tableColumns.filter((col: any) => col.type !== 'checkbox'),
    proxyConfig: {
      seq: true,
      autoLoad: false,
      response: {
        result: 'result.records',
        total: 'result.total'
      },
      ajax: {
        // sorts: [{ field: string, order: 'asc' | 'desc' }] 列配置需开启 sortable: true
        query: async ({ page, sorts }, filterValues) => {
          const formValues = await formApi.getValues();
          return queryFunction({ page, formValues, filterValues, sorts });
        }
      }
    }
  });

  // 排序变化时触发服务端查询
  const handleSortChange = () => {
    gridApi.commitProxy('query');
  };

  const [Grid, gridApi] = useSunnyQueryGrid({
    gridOptions,
    gridEvents: {
      sortChange: handleSortChange,
      ...gridEvents
    }
  });

  // ----------------------------------------------------------------------
  // 5. Search Plan Configuration
  // ----------------------------------------------------------------------

  // 处理查询方案搜索
  const handleSearchPlanSearch = async (formValues: any) => {
    // 设置表单值
    await formApi.setValues(formValues);
    // 触发表格查询
    await gridApi.commitProxy('query');
  };

  // 处理默认查询方案加载完成
  const handleDefaultPlanLoaded = async (formValues: any) => {
    // 设置表单值
    await formApi.setValues(formValues);
    // 根据autoLoad参数决定是否触发表格查询
    if (autoLoad) {
      await gridApi.commitProxy('query');
    }
  };

  // 设置查询方案配置（通过searchPlanConfig.enable控制是否启用）
  // 使用setTimeout确保formApi和gridApi都已初始化
  setTimeout(() => {
    formApi.setState({
      searchPlanConfig: {
        enable: true,
        formConfig: searchFormSchema,
        currentSearchPlan: currentSearchPlan.value,
        searchPlanList: searchPlanList.value,
        resourceId,
        nResourceid,
        api: searchPlanApi,
        onSearch: handleSearchPlanSearch,
        onDefaultPlanLoaded: handleDefaultPlanLoaded,
        onUpdateCurrentSearchPlan: (value) => {
          currentSearchPlan.value = value;
        },
        onUpdateSearchPlanList: (value) => {
          searchPlanList.value = value;
        }
      }
    });
  }, 0);

  // 监听searchPlanList和currentSearchPlan的变化，更新searchPlanConfig
  watch([searchPlanList, currentSearchPlan], ([newSearchPlanList, newCurrentSearchPlan]) => {
    formApi.setState({
      searchPlanConfig: {
        ...formApi.getState().searchPlanConfig,
        searchPlanList: newSearchPlanList,
        currentSearchPlan: newCurrentSearchPlan
      }
    });
  }, { deep: true });

  // ----------------------------------------------------------------------
  // 5. Form Submit Handler
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

  // 资源按钮列表
  const resourceButtons = ref<any[]>([]);

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
