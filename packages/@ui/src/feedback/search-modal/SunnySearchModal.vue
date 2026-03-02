<script setup lang="ts">
import { ref, watch, nextTick, computed, useSlots } from 'vue';
import { useSunnySearchModal } from './use-sunny-search-modal';
import type { SunnySearchModalProps, SunnySearchModalEmits } from './types';
import { $t } from '@sunny-base-web/locales';
// @ts-ignore
import SunnyForm from '../../entry/form/SunnyForm.vue';
// @ts-ignore
import SunnyQueryGrid from '../../data/query-grid/use-query-grid.vue';
// @ts-ignore
import SunnyModal from '../modal/Modal.vue';
// @ts-ignore
import { IconClose } from '@arco-design/web-vue/es/icon';
// @ts-ignore
import { Tooltip, Pagination, Button } from '@arco-design/web-vue';
// @ts-ignore
import SunnyScrollbar from '../../basic/scrollbar/scrollbar.vue';

defineOptions({
  name: 'SunnySearchModal',
  inheritAttrs: false,
});

// 获取外部传入的 slots，用于透传给 SunnyForm（支持字段级别的 slot）
const externalSlots = useSlots();

const props = withDefaults(defineProps<SunnySearchModalProps>(), {
  title: '数据查询', // Should be i18n in real app
  multiple: true,
  rowKey: 'id',
  helpMessage: '支持跨页多选，翻页保留选中状态；双击表格行可快速确认。',
  fieldNames: () => ({ label: 'label', value: 'value', desc: 'desc' }),
  commonConfig: () => ({
    colProps: { xs: 24, sm: 12, md: 6, lg: 6, xl: 6, xxl: 6 },
  }),
  width: '800px',
  contentHeight: 300,
  resetOnOpen: true,
  clearOnSearch: false,
});

const emit = defineEmits<SunnySearchModalEmits>();

const localVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

const gridRef = ref();
const formRef = ref<InstanceType<typeof SunnyForm> | null>(null);

const {
  loading,
  searchParams,
  selectedRows,
  pagination,
  tableData,
  actualFieldNames,
  actualRowKey,
  initDefaultValues,
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
} = useSunnySearchModal(props, emit);

// 暴露方法给父组件调用
defineExpose({
  reset
});

const handleReset = async () => {
  // 重置时重置分页为第一页，并重新初始化默认值
  pagination.value.current = 1;
  initDefaultValues();
  await nextTick();
  await validateAndSearch();
};

/**
 * 校验表单并执行查询
 * @returns {Promise<boolean>} 是否查询成功
 */
const validateAndSearch = async (): Promise<boolean> => {
  if (!formRef.value) {
    handleSearch();
    return true;
  }

  try {
    const { valid } = await formRef.value.validate();
    if (valid) {
      handleSearch();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Form validation failed:', error);
    return false;
  }
};

/**
 * 处理表单提交（点击查询按钮）
 * 先重置分页为第一页，再校验并查询
 * @param values - 表单提交的值
 */
const handleFormSubmit = async (values: Record<string, any>) => {
  pagination.value.current = 1;
  // 根据 clearOnSearch 配置决定是否清空已选数据
  if (props.clearOnSearch) {
    selectedRows.value = [];
  }
  // 直接使用表单提交的值进行查询
  handleSearch(values);
};

// --- Grid Config ---
const gridOptions = computed(() => ({
  border: true,
  stripe: true,
  showOverflow: true,
  height: props.contentHeight,
  align: 'center',
  autoResize: true, // 自动监听父容器变化
  columnConfig: { resizable: true },
  rowConfig: { isCurrent: true, isHover: true, keyField: actualRowKey.value },
  checkboxConfig: {
    trigger: 'row',
    highlight: true,
    reserve: false, // 关闭 reserve，完全由 selectedRows 控制选中状态
  },
  radioConfig: {
    trigger: 'row',
    highlight: true,
    reserve: false,
  },
}));

// 当 tableData 或 selectedRows 变化时，同步选中状态到表格
watch(
  [() => tableData.value, () => selectedRows.value],
  async () => {
    await nextTick();
    const $grid = gridRef.value?.getGrid?.() || gridRef.value;
    if ($grid && tableData.value.length > 0) {
      // 先清空当前页的所有选中
      $grid.clearCheckboxRow();
      // 然后选中当前页中应该在 selectedRows 中的行
      const rowsToCheck = tableData.value.filter(row =>
        selectedRows.value.some(selected => selected[actualRowKey.value] === row[actualRowKey.value])
      );
      if (rowsToCheck.length > 0) {
        $grid.setCheckboxRow(rowsToCheck, true);
      }
    }
  },
  { deep: true }
);

// Double click to confirm (only in single mode)
const handleCellDblClick = ({ row }: any) => {
  if (!props.multiple) {
     // Single mode: select this row and close
     selectedRows.value = [row];
     handleOk();
  } else {
     // Multiple mode: toggle selection, don't close
     const isSelected = selectedRows.value.some(
       selected => selected[actualRowKey.value] === row[actualRowKey.value]
     );
     toggleRowSelection(row, !isSelected);
  }
};

// Initial Search when opening
watch(
  () => props.visible,
  (val) => {
    if (val) {
      // 先初始化默认值
      initDefaultValues();
      // 根据 resetOnOpen 决定是否重新查询表格数据
      if (props.resetOnOpen) {
        // 先清空表格数据，再触发查询
        tableData.value = [];
        pagination.value.total = 0;
        nextTick(() => {
          validateAndSearch();
        });
      }
    }
  }
);
</script>

<template>
  <SunnyModal
    v-model="localVisible"
    :title="props.title"
    :width="props.width"
    unmount-on-close
    title-align="start"
    :fullscreen="false"
    :help-message="props.helpMessage"
    @cancel="handleCancel"
    @close="handleCancel"
    @ok="handleOk"
  >
    <div class="flex flex-col h-full">
      <!-- Search Form -->
      <div class="mb-4 border-b border-gray-100 pb-4 shrink-0">
        <SunnyForm
          ref="formRef"
          v-model:values="searchParams"
          :schema="props.formSchema"
          :common-config="props.commonConfig"
          show-default-actions
          :reset-button-options="{ show: true }"
          @submit="handleFormSubmit"
          @reset="handleReset"
          layout="vertical"
        >
          <!-- 透传字段级别的 slots（如 form-item-fieldName） -->
          <template v-for="(_, name) in externalSlots" :key="name" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps"></slot>
          </template>
        </SunnyForm>
      </div>
      <!-- Content Body -->
      <div class="flex min-h-0 overflow-hidden box-border border border-gray-200 rounded" :style="{ height: (typeof props.contentHeight === 'number' ? props.contentHeight + 'px' : props.contentHeight) }">
        <!-- Left: Table -->
        <div class="flex-1 overflow-hidden">
           <SunnyQueryGrid
              ref="gridRef"
              :columns="props.tableColumns"
              :data="tableData"
              :loading="loading"
              v-bind="gridOptions"
              @checkbox-change="handleCheckboxChange"
              @checkbox-all="handleCheckboxAll"
              @radio-change="handleRadioChange"
              @cell-dblclick="handleCellDblClick"
           />
        </div>

        <!-- Right: Sidebar -->
        <div class="w-[180px] border-l border-gray-200 bg-gray-50 flex flex-col ml-2 overflow-hidden shrink-0">
           <div class="font-bold px-2 py-2 text-gray-700 flex justify-between items-center text-xs border-b border-gray-200 shrink-0">
             <span>{{ $t('common.selected') }} ({{ selectedRows.length }})</span>
             <span v-if="selectedRows.length" class="text-xs text-blue-500 cursor-pointer" @click="selectedRows = []">
               {{ $t('common.clear') }}
             </span>
           </div>

           <div class="flex-1 min-h-0 overflow-y-auto p-2 custom-scrollbar">
              <template v-if="selectedRows.length">
                <div
                  v-for="row in selectedRows"
                  :key="row[actualRowKey]"
                  class="relative group px-2 py-1 mb-1 bg-white border border-gray-200 rounded hover:shadow-sm transition-all h-[42px] flex flex-col justify-center"
                >
                   <Tooltip :content="`${row[actualFieldNames.desc]}`">
                      <div class="text-xs font-medium text-gray-800 truncate leading-none mb-1">
                        {{ row[actualFieldNames.value] || '-' }}
                      </div>
                      <div class="text-[10px] text-gray-500 truncate leading-none">
                        {{ row[actualFieldNames.label] || '&nbsp;' }}
                      </div>
                   </Tooltip>

                   <div
                     class="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 cursor-pointer text-gray-400 hover:text-red-500 transition-opacity p-0.5 bg-white rounded-full shadow-sm"
                     @click="removeRow(row)"
                   >
                     <IconClose :size="10" />
                   </div>
                </div>
              </template>
              <div v-else class="h-full flex items-center justify-center text-gray-400 text-xs">
                 {{ $t('common.noData') }}
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-between items-center w-full">
         <Pagination
           v-model:current="pagination.current"
           :page-size="pagination.pageSize"
           :total="pagination.total"
           show-total
           show-page-size
           :page-size-options="[20, 50, 100, 200]"
           size="small"
           @change="handlePageChange"
           @page-size-change="handlePageSizeChange"
         />
         <div class="space-x-2">
           <Button @click="handleCancel">{{ $t('common.cancel') }}</Button>
           <Button type="primary" @click="handleOk">{{ $t('common.confirm') }}</Button>
         </div>
      </div>
    </template>
  </SunnyModal>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>
