import { ref, computed, watch } from 'vue';
import type { SunnySearchModalProps, SunnySearchModalEmits } from './types';
import { cloneDeep, get } from 'lodash-es';
// @ts-ignore
import { Message } from '@arco-design/web-vue';

/**
 * 从 formSchema 中提取默认值
 */
function extractDefaultValues(formSchema: any[] | undefined): Record<string, any> {
  if (!formSchema || !Array.isArray(formSchema)) return {};

  const defaults: Record<string, any> = {};
  formSchema.forEach((item) => {
    if (item.fieldName && item.defaultValue !== undefined) {
      defaults[item.fieldName] = item.defaultValue;
    }
  });
  return defaults;
}

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

  const actualRowKey = computed(() => props.fieldNames?.value || 'id');

  // --- Helpers ---
  const getRowKey = (row: any) => get(row, actualRowKey.value);

  /**
   * 获取 formSchema 中定义的字段名集合
   */
  const getSchemaFieldNames = () => {
    return new Set(
      (props.formSchema || [])
        .map((item: any) => item.fieldName)
        .filter(Boolean),
    );
  };

  /**
   * 初始化表单默认值（打开弹窗时调用）
   * 优先级: props.defaultModel > FormSchema.defaultValue
   */
  const initDefaultValues = () => {
    const defaults = extractDefaultValues(props.formSchema);
    searchParams.value = { ...defaults, ...props.defaultModel };
  };

  /**
   * 重置表单默认值（点击重置按钮时调用）
   * 只重置 formSchema 中定义的字段，保留其他字段不变
   */
  const resetFormValues = () => {
    const defaults = extractDefaultValues(props.formSchema);
    const schemaFields = getSchemaFieldNames();

    // 只取 defaultModel 中属于表单字段的部分
    const defaultModelForSchema: Record<string, any> = {};
    if (props.defaultModel) {
      Object.entries(props.defaultModel).forEach(([key, value]) => {
        if (schemaFields.has(key)) {
          defaultModelForSchema[key] = value;
        }
      });
    }

    searchParams.value = {
      ...searchParams.value,
      ...defaults,
      ...defaultModelForSchema,
    };
  };

  // Sync modelValue to selectedRows when visible becomes true
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        // 同步 modelValue 到 selectedRows
        if (props.modelValue && Array.isArray(props.modelValue)) {
          selectedRows.value = cloneDeep(props.modelValue as Record<string, any>[]);
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
   * @param params - 可选的查询参数，如果不传则使用 searchParams
   */
  const handleSearch = async (params?: Record<string, any>) => {
    if (!props.searchApi) return;

    // 如果传入了参数，同步更新 searchParams
    if (params) {
      searchParams.value = { ...params };
    }

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
      }
      // Note: searchApi as string is not supported, please use function instead

      if (result) {
        // Assuming result structure: { list: [], total: 0 } or standard page wrapper
        const list = result.list || result.records || [];
        const total = result.total || result.totalCount || 0;

        tableData.value = list;
        pagination.value.total = total;
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

  const handleRadioChange = (params: any) => {
    const { row } = params;
    selectedRows.value = [row];
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
    // 取消时清空已选数据
    selectedRows.value = [];
    emit('update:modelValue', []);
    emit('cancel');
    emit('update:visible', false);
  };

  /**
   * 重置表格数据和已选数据
   * 清空表格数据、已选数据，并重置分页
   */
  const reset = () => {
    tableData.value = [];
    selectedRows.value = [];
    pagination.value.current = 1;
    pagination.value.total = 0;
    emit('update:modelValue', []);
  };

  return {
    loading,
    searchParams,
    selectedRows,
    pagination,
    tableData,
    actualFieldNames,
    actualRowKey,
    initDefaultValues,
    resetFormValues,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleCheckboxChange,
    handleCheckboxAll,
    handleRadioChange,
    removeRow,
    handleOk,
    handleCancel,
    toggleRowSelection,
    reset
  };
}
