<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
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

defineOptions({
  name: 'SunnySearchModal',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<SunnySearchModalProps>(), {
  title: '数据查询', // Should be i18n in real app
  multiple: true,
  rowKey: 'id',
  helpMessage: '支持跨页多选，翻页保留选中状态；双击表格行可快速确认。',
  fieldNames: () => ({ label: 'label', value: 'value', desc: 'desc' }),
  commonConfig: () => ({
    colProps: { xs: 24, sm: 12, md: 8, lg: 8, xl: 8, xxl: 8 },
  }),
  width: '800px',
  contentHeight: 300,
});

const emit = defineEmits<SunnySearchModalEmits>();

const gridRef = ref();

const {
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
} = useSunnySearchModal(props, emit);

const isMaximized = ref(false);
const handleFullscreenChange = (val: boolean) => {
  isMaximized.value = val;
};

const modalBodyStyle = computed(() => {
  if (isMaximized.value) {
    return {
      height: '100%',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    };
  }
  return {};
});

const handleReset = async () => {
  await nextTick();
  handleSearch();
};

// --- Grid Config ---
const gridOptions = computed(() => ({
  border: true,
  stripe: true,
  showOverflow: true,
  height: 'auto',
  align: 'center',
  columnConfig: { resizable: true },
  rowConfig: { isCurrent: true, isHover: true, keyField: actualRowKey.value },
  checkboxConfig: {
    trigger: 'row',
    highlight: true,
    reserve: true, // Important for cross-page selection
  },
}));

// Sync Grid Selection when selectedRows changes or data loads
watch(
  [() => selectedRows.value, () => tableData.value],
  async () => {
    await nextTick();
    const $grid = gridRef.value?.getGrid?.() || gridRef.value;
    if ($grid) {
      // Use vxe-table setCheckboxRow to sync state
      // We pass the selectedRows and true to check them
      // But we need to be careful: setCheckboxRow(rows, checked)
      
      // Strategy: Clear all first? No, that clears reserve.
      // Strategy: Set current page rows based on selectedRows
      
      const rowsToCheck = tableData.value.filter(row => 
        selectedRows.value.some(selected => selected[actualRowKey.value] === row[actualRowKey.value])
      );
      
      // Uncheck all on current page first to be safe?
      // Actually vxe-table's setCheckboxRow handles 'toggling' if not specified, or explicit boolean
      
      // Ideally we want: "Make sure these rows are checked, and others on this page are unchecked"
      // But 'reserve' mode complicates this.
      
      // Simple approach for now:
      $grid.setCheckboxRow(rowsToCheck, true);
      
      // Find rows on current page that should NOT be checked
      const rowsToUncheck = tableData.value.filter(row => 
        !selectedRows.value.some(selected => selected[actualRowKey.value] === row[actualRowKey.value])
      );
      $grid.setCheckboxRow(rowsToUncheck, false);
    }
  },
  { deep: true } // selectedRows is deep
);

// Double click to confirm
const handleCellDblClick = ({ row }: any) => {
  if (!props.multiple) {
     // Single mode: clear others, select this, then OK
     selectedRows.value = [row];
     handleOk();
  } else {
     // Multiple mode: Just toggle this one (if not selected) and maybe not confirm immediately?
     // Spec says: Double Click -> Save & Close.
     // So we ensure it is selected, then confirm.
     toggleRowSelection(row, true);
     handleOk();
  }
};

// Initial Search when opening
watch(
  () => props.visible,
  (val) => {
    if (val) {
      handleSearch();
    }
  }
);
</script>

<template>
  <SunnyModal
    :model-value="props.visible"
    :title="props.title"
    :width="props.width"
    :top="50"
    :mask-closable="false"
    unmount-on-close
    :help-message="props.helpMessage"
    :body-style="modalBodyStyle"
    @cancel="handleCancel"
    @ok="handleOk"
    @close="handleCancel"
    @fullscreen-change="handleFullscreenChange"
  >
    <div class="flex flex-col" :style="{ height: isMaximized ? '100%' : (typeof props.contentHeight === 'number' ? props.contentHeight + 'px' : props.contentHeight) }">
      <!-- Search Form -->
      <div class="mb-4 border-b border-gray-100 pb-4">
        <SunnyForm
          v-model:model="searchParams"
          :schema="props.formSchema"
          :common-config="props.commonConfig"
          show-default-actions
          :reset-button-options="{ show: true }"
          @submit="handleSearch"
          @reset="handleReset"
          layout="horizontal"
        >
          <template #submit-before>
            <!-- Add any extra buttons if needed -->
          </template>
        </SunnyForm>
      </div>

      <!-- Content Body -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Left: Table -->
        <div class="flex-1 h-full overflow-hidden flex flex-col">
           <SunnyQueryGrid
              ref="gridRef"
              :columns="props.tableColumns"
              :data="tableData"
              :loading="loading"
              v-bind="gridOptions"
              class="flex-1"
              @checkbox-change="handleCheckboxChange"
              @checkbox-all="handleCheckboxAll"
              @cell-dblclick="handleCellDblClick"
           />
        </div>

        <!-- Right: Sidebar -->
        <div class="w-[180px] border-l border-gray-200 bg-gray-50 flex flex-col ml-2 pl-2 py-2">
           <div class="font-bold mb-2 text-gray-700 flex justify-between items-center text-xs">
             <span>{{ $t('common.selected') }} ({{ selectedRows.length }})</span>
             <span v-if="selectedRows.length" class="text-xs text-blue-500 cursor-pointer" @click="selectedRows = []">
               {{ $t('common.clear') }}
             </span>
           </div>
           
           <div class="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <template v-if="selectedRows.length">
                <div 
                  v-for="row in selectedRows" 
                  :key="row[actualRowKey]"
                  class="relative group px-2 py-1 mb-1 bg-white border border-gray-200 rounded hover:shadow-sm transition-all h-[42px] flex flex-col justify-center"
                >
                   <Tooltip :content="row[actualFieldNames.label] + (row[actualFieldNames.desc] ? ' (' + row[actualFieldNames.desc] + ')' : '')">
                      <div class="text-xs font-medium text-gray-800 truncate leading-none mb-1">
                        {{ row[actualFieldNames.label] || '-' }}
                      </div>
                      <div class="text-[10px] text-gray-500 truncate leading-none">
                        {{ row[actualFieldNames.desc] || '&nbsp;' }}
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
