import { ref, reactive, watch } from 'vue';
import axios from 'axios';
import type { SunnySearchModalProps, SunnySearchModalEmits, SearchConfig } from './types';
import { useSunnyQueryGrid } from '../../data/query-grid';

export function useSunnySearchModal(props: SunnySearchModalProps, emit: SunnySearchModalEmits) {
  const loading = ref(false);
  const config = ref<SearchConfig | null>(null);
  const selectedRows = ref<Record<string, any>[]>([]);
  const searchParams = ref<Record<string, any>>({});
  
  // Define reactive grid options
  const gridOptions = reactive({
      columns: [] as any[],
      data: [] as any[],
      height: 'auto',
      align: 'center' as const,
      border: true,
      resizable: true,
      showOverflow: true,
      layouts: ['Table'], // Hide default pager
      loading: false,
      rowConfig: {
        keyField: props.rowKey || 'id',
        isCurrent: true,
        isHover: true,
      },
      checkboxConfig: {
        reserve: true,
        highlight: true,
        trigger: 'row'
      },
      pagerConfig: {
        enabled: true,
        pageSize: 20,
        pageSizes: [10, 20, 50, 100, 200],
        total: 0,
        currentPage: 1
      }
  });

  // Grid Setup
  const [GridComponent, gridApi] = useSunnyQueryGrid({
    gridOptions, // Pass reactive object
    gridEvents: {
      checkboxChange: ({ checked, row }: any) => {
        const keyField = props.rowKey || config.value?.rowKey || 'id';
        if (checked) {
          // Add if not exists
          const exists = selectedRows.value.some(r => r[keyField] === row[keyField]);
          if (!exists) {
            selectedRows.value = [...selectedRows.value, row];
          }
        } else {
          // Remove
          selectedRows.value = selectedRows.value.filter(r => r[keyField] !== row[keyField]);
        }
      },
      checkboxAll: ({ checked }: any) => {
        const keyField = props.rowKey || config.value?.rowKey || 'id';
        if (gridApi.instance) {
          const { fullData } = gridApi.instance.getTableData();
          if (checked) {
            // Add all current data to selectedRows
            const toAdd = fullData.filter(row => !selectedRows.value.some(r => r[keyField] === row[keyField]));
            selectedRows.value = [...selectedRows.value, ...toAdd];
          } else {
            // Remove all current data from selectedRows
            const currentIds = new Set(fullData.map(r => r[keyField]));
            selectedRows.value = selectedRows.value.filter(r => !currentIds.has(r[keyField]));
          }
        }
      },
      pageChange: ({ currentPage, pageSize }: any) => {
          doSearch(currentPage, pageSize);
      },
      cellDblclick: () => {
        emit('confirm', selectedRows.value);
        emit('update:modelValue', selectedRows.value);
        emit('update:visible', false);
      }
    }
  });

  const loadConfig = async () => {
      // 优先使用静态配置
      if (props.staticConfig) {
          config.value = props.staticConfig;
          if (config.value?.rowKey) {
              gridOptions.rowConfig.keyField = config.value.rowKey;
              // 确保 rowConfig 对象引用更新，使 Grid 感知变化
              gridOptions.rowConfig = { ...gridOptions.rowConfig };
          }
          if (config.value?.tableColumns) {
              if (gridApi.instance) {
                  gridApi.instance.reloadColumn(config.value.tableColumns);
              } else {
                  gridOptions.columns = config.value.tableColumns;
              }
          }
          doSearch(1, 20);
          return;
      }

      if (!props.sqlNum) return;
      loading.value = true;
      try {
          const res = await axios.get(`/api/common/search-config`, { params: { sqlNum: props.sqlNum } });
          config.value = res.data;
          
          if (config.value?.rowKey) {
              gridOptions.rowConfig.keyField = config.value.rowKey;
              // 确保 rowConfig 对象引用更新，使 Grid 感知变化
              gridOptions.rowConfig = { ...gridOptions.rowConfig };
          }

          if (config.value?.tableColumns) {
              if (gridApi.instance) {
                  gridApi.instance.reloadColumn(config.value.tableColumns);
              } else {
                  gridOptions.columns = config.value.tableColumns;
              }
          }
          
          doSearch(1, 20);
      } catch (e) {
          console.error('Failed to load config', e);
      } finally {
          loading.value = false;
      }
  };

  const doSearch = async (pageNo = 1, pageSize = 20) => {
      if (!config.value) return;
      
      const apiEndpoint = config.value.searchApi || '/api/common/query';
      const payload = {
          pageNo,
          pageSize,
          sqlNum: props.sqlNum,
          conditions: {
              ...(props.conditions || {}),
              ...searchParams.value
          }
      };
      
      try {
          gridOptions.loading = true;
          
          const res = await axios.post(apiEndpoint, payload);
          const data = res.data.list || res.data.data || (Array.isArray(res.data) ? res.data : []);
          const total = res.data.total || data.length;
          
          if (gridApi.instance) {
              // 使用 loadData 而不是 reloadData，以更好地保留选中状态 (配合 checkboxConfig.reserve)
              // Use loadData instead of reloadData to better preserve selection state (with checkboxConfig.reserve)
              await gridApi.instance.loadData(data);
              // 手动同步选中状态，防止 reserve 失效
              // Manually sync selection state to prevent reserve failure
              gridApi.instance.setCheckboxRow(selectedRows.value, true);
          } else {
              gridOptions.data = data;
          }
          
          if (gridOptions.pagerConfig) {
              gridOptions.pagerConfig.total = total;
              gridOptions.pagerConfig.currentPage = pageNo;
              gridOptions.pagerConfig.pageSize = pageSize;
          }
          
      } catch (e) {
          console.error('Search failed', e);
      } finally {
          gridOptions.loading = false;
      }
  };

  watch(() => props.visible, (val) => {
      if (val) {
          // Reset selected rows from modelValue when opening
          selectedRows.value = props.modelValue ? [...props.modelValue] : [];
          loadConfig();
      }
  }, { immediate: true });

  const handleSearch = (values: any) => {
      searchParams.value = values;
      doSearch(1, gridOptions.pagerConfig?.pageSize || 20);
  };
  
  const handleReset = () => {
      searchParams.value = {};
      handleSearch({});
  };
  
  const removeRow = (row: any) => {
      const rowKey = props.rowKey || config.value?.rowKey || 'id';
      const index = selectedRows.value.findIndex(r => r[rowKey] === row[rowKey]);
      if (index > -1) {
          const newRows = [...selectedRows.value];
          newRows.splice(index, 1);
          selectedRows.value = newRows;
          if (gridApi.instance) {
             gridApi.instance.setCheckboxRow([row], false);
          }
      }
  };

  return {
    loading,
    config,
    selectedRows,
    searchParams,
    GridComponent,
    gridApi,
    gridOptions,
    doSearch,
    handleSearch,
    handleReset,
    removeRow
  };
}
