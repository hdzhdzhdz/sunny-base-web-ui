import { ref, computed, watch, toRaw, nextTick } from 'vue';
import type { SunnySearchModalProps, SunnySearchModalEmits } from './types';
import { cloneDeep, get } from 'lodash-es';
// @ts-ignore
import { Message } from '@arco-design/web-vue';

export function useSunnySearchModal(
  props: SunnySearchModalProps,
  emit: SunnySearchModalEmits
) {
  // --- State ---
  const loading = ref(false);
  const searchParams = ref<Record<string, any>>({});
  
  // 选中的行 (Manual management)
  const selectedRows = ref<Record<string, any>[]>([]);

  // Pagination
  const pagination = ref({
    current: 1,
    pageSize: 200, // Default 200 as per spec
    total: 0,
  });

  // Grid Data
  const tableData = ref<any[]>([]);

  // --- Computed ---
  const actualFieldNames = computed(() => ({
    label: 'label',
    value: 'value',
    desc: 'desc',
    ...props.fieldNames,
  }));

  const actualRowKey = computed(() => props.rowKey || 'id');

  // --- Helpers ---
  const getRowKey = (row: any) => get(row, actualRowKey.value);

  // Sync modelValue to selectedRows when visible becomes true or modelValue changes
  watch(
    () => [props.visible, props.modelValue],
    ([visible, modelValue]) => {
      if (visible) {
         if (modelValue && Array.isArray(modelValue)) {
            // Merge or Replace? Usually Replace on open if strictly controlled.
            // But let's respect current modelValue.
             selectedRows.value = cloneDeep(modelValue as Record<string, any>[]);
         } else {
             selectedRows.value = [];
         }
      }
    },
    { immediate: true }
  );

  // --- Methods ---

  /**
   * Execute Search
   */
  const handleSearch = async () => {
    if (!props.searchApi) return;

    loading.value = true;
    try {
      const payload = {
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
        ...searchParams.value,
      };

      let result;
      if (typeof props.searchApi === 'function') {
        result = await props.searchApi(payload);
      } else if (typeof props.searchApi === 'string') {
        // TODO: Implement generic request here using your project's request utility
        // For now assume global fetch or axios is available, or throw error if not integrated
        console.warn('String searchApi requires a global request handler implementation.');
        // result = await request.post(props.searchApi, payload);
      }

      if (result) {
        // Assuming result structure: { list: [], total: 0 } or standard page wrapper
        const list = result.list || result.records || [];
        const total = result.total || result.totalCount || 0;
        
        tableData.value = list;
        pagination.value.total = total;
        
        // Restore selection state for current page
        await nextTick();
        restoreSelection();
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Use i18n key in real impl
      Message.error('查询失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * Handle Page Change
   */
  const handlePageChange = (current: number) => {
    pagination.value.current = current;
    handleSearch();
  };

  /**
   * Handle Page Size Change
   */
  const handlePageSizeChange = (pageSize: number) => {
    pagination.value.pageSize = pageSize;
    pagination.value.current = 1; // Reset to first page
    handleSearch();
  };

  /**
   * Sync Grid Checkbox State with selectedRows
   */
  const restoreSelection = () => {
    // This function needs access to grid instance, 
    // but since we are in hook, we might return a handler or use a ref passed in.
    // For simplicity in this architecture, we will let the Component handle the grid ref interaction
    // OR we expose a method that the component calls.
    // Actually, vxe-grid 'checkRowKeys' prop might be easier if supported, 
    // but for 'reserve' and complex logic, manual 'setCheckboxRow' is often better.
  };

  /**
   * Add/Remove Row to/from Selection
   */
  const toggleRowSelection = (row: any, checked: boolean) => {
    const key = getRowKey(row);
    const index = selectedRows.value.findIndex(item => getRowKey(item) === key);

    if (checked) {
      if (index === -1) {
        if (!props.multiple) {
           selectedRows.value = [row];
        } else {
           selectedRows.value.push(row);
        }
      }
    } else {
      if (index > -1) {
        selectedRows.value.splice(index, 1);
      }
    }
  };

  const handleCheckboxChange = (params: any) => {
    const { row, checked } = params;
    toggleRowSelection(row, checked);
  };

  const handleCheckboxAll = (params: any) => {
    const { checked, records } = params;
    // Note: 'records' only contains currently visible selected rows.
    // When unchecking all, we only remove currently visible rows from selectedRows
    // When checking all, we add currently visible rows
    
    // Logic needs to be careful not to remove rows from other pages if "reserve" is true concept.
    // But vxe-table 'checkbox-all' event usually gives current page records.
    
    // For robustness:
    // 1. If checked: Add all `records` to `selectedRows` (avoid duplicates)
    // 2. If unchecked: Remove all rows in current `tableData` from `selectedRows`
    
    if (checked) {
       records.forEach((row: any) => toggleRowSelection(row, true));
    } else {
       // Remove all visible rows
       tableData.value.forEach(row => toggleRowSelection(row, false));
    }
  };

  /**
   * Remove row from Sidebar
   */
  const removeRow = (row: any) => {
    toggleRowSelection(row, false);
    // Need to trigger grid update in Component
  };

  const handleOk = () => {
    emit('update:modelValue', selectedRows.value);
    emit('confirm', selectedRows.value);
    emit('update:visible', false);
  };

  const handleCancel = () => {
    emit('cancel');
    emit('update:visible', false);
  };

  return {
    loading,
    searchParams,
    selectedRows,
    pagination,
    tableData,
    actualFieldNames,
    actualRowKey,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleCheckboxChange,
    handleCheckboxAll,
    removeRow,
    handleOk,
    handleCancel,
    toggleRowSelection
  };
}
