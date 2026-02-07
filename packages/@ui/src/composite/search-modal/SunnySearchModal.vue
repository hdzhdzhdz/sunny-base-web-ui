<script setup lang="ts">
import { computed } from 'vue';
import { IconClose } from '@arco-design/web-vue/es/icon';
import { Modal as SunnyModal } from '../../feedback/modal';
import { SunnyForm } from '../../entry/form';
import { useSunnySearchModal } from './use-sunny-search-modal';
import type { SunnySearchModalProps, SunnySearchModalEmits } from './types';

const props = withDefaults(defineProps<SunnySearchModalProps>(), {
  width: '1200px',
  multiple: true,
  rowKey: 'id',
  fieldNames: () => ({ label: 'name', value: 'id', desc: 'code' })
});

const emit = defineEmits<SunnySearchModalEmits>();

const {
  config,
  searchParams,
  selectedRows,
  GridComponent,
  gridOptions,
  doSearch,
  handleSearch,
  handleReset,
  removeRow
} = useSunnySearchModal(props, emit);

const commonConfig = computed(() => {
  const defaults = { 
    colProps: { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 } 
  };
  // Props > Config > Defaults
  return { 
    ...defaults, 
    ...(config.value?.commonConfig || {}), 
    ...(props.commonConfig || {}) 
  };
});

const helpMessage = computed(() => {
  return props.helpMessage ?? '💡 支持跨页多选，双击行快速确认';
});

const localVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const handleOk = () => {
  emit('confirm', selectedRows.value);
  emit('update:modelValue', selectedRows.value);
  emit('update:visible', false);
};

const handleCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};

const onPageChange = (page: number) => {
  if (gridOptions.pagerConfig) {
    doSearch(page, gridOptions.pagerConfig.pageSize);
  }
};

const onPageSizeChange = (pageSize: number) => {
  if (gridOptions.pagerConfig) {
    doSearch(1, pageSize);
  }
};
</script>

<template>
  <SunnyModal
    v-model="localVisible"
    :width="props.width"
    :body-style="{ padding: 0 }"
    :help-message="helpMessage"
    @ok="handleOk"
    @close="handleCancel"
  >
    <!-- Custom Header -->
    <template #title>
      <div class="flex items-center space-x-2">
        <span>{{ props.title || config?.title || $t('common.searchModal.title') }}</span>
      </div>
    </template>

    <div class="sunny-search-modal-layout flex flex-col h-[500px]">
      <!-- Top: Search Form -->
      <div class="shrink-0 p-4 pb-0" v-if="config && config.formSchema && config.formSchema.length > 0">
        <SunnyForm
          :schema="config.formSchema"
          :values="searchParams"
          :common-config="commonConfig"
          show-default-actions
          @submit="handleSearch"
          @reset="handleReset"
        />
      </div>

      <!-- Bottom: Body (Table + Sidebar) -->
      <div class="flex-1 flex overflow-hidden border-t border-[var(--color-border-2)]">
        <!-- Left: Table -->
        <div class="flex-1 overflow-hidden h-full relative">
          <component 
            :is="GridComponent" 
            v-if="GridComponent" 
            class="h-full" 
          />
        </div>

        <!-- Right: Selected List -->
        <div class="w-64 border-l border-[var(--color-border-2)] flex flex-col bg-[var(--color-bg-2)]">
          <div class="p-3 border-b border-[var(--color-border-2)] font-bold text-[var(--color-text-1)] flex justify-between items-center">
            <span>{{ $t('common.searchModal.selectedRecords') }}</span>
            <span class="text-xs text-[var(--color-text-3)] bg-[var(--color-fill-2)] px-2 py-0.5 rounded-full">{{ selectedRows.length }}</span>
          </div>
          <div class="flex-1 overflow-y-auto p-3 space-y-2">
            <div 
              v-for="row in selectedRows" 
              :key="row[props.rowKey]" 
              class="relative h-[46px] px-2 py-1 border border-[var(--color-border-2)] rounded bg-[var(--color-bg-1)] hover:shadow-sm transition-all flex flex-col justify-center group"
            >
              <!-- Label -->
              <div class="text-xs font-bold text-[var(--color-text-1)] truncate leading-tight pr-4">
                <a-tooltip :content="row[props.fieldNames?.label || 'name']">
                  {{ row[props.fieldNames?.label || 'name'] }}
                </a-tooltip>
              </div>
              <!-- Desc -->
              <div class="text-xs text-[var(--color-text-3)] truncate mt-0.5 pr-4">
                 <a-tooltip :content="row[props.fieldNames?.desc || 'code']">
                  {{ row[props.fieldNames?.desc || 'code'] }}
                </a-tooltip>
              </div>
              <!-- Close Icon -->
              <div 
                class="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-[var(--color-fill-3)] cursor-pointer text-[var(--color-text-3)] hover:text-[var(--color-danger-light-4)] transition-all opacity-0 group-hover:opacity-100"
                @click="removeRow(row)"
              >
                <icon-close :size="10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Footer -->
    <template #footer>
      <div class="flex justify-between items-center w-full">
        <!-- Left: Pagination -->
        <div class="flex-1 flex justify-start">
          <a-pagination 
            v-if="gridOptions.pagerConfig"
            size="small" 
            :total="gridOptions.pagerConfig.total" 
            :current="gridOptions.pagerConfig.currentPage" 
            :page-size="gridOptions.pagerConfig.pageSize"
            show-total 
            show-jumper
            show-page-size
            :page-size-options="[10, 20, 50, 100, 200]"
            @change="onPageChange"
            @page-size-change="onPageSizeChange"
          />
        </div>
        
        <!-- Right: Buttons -->
        <div class="space-x-2">
          <a-button @click="handleCancel">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" @click="handleOk">{{ $t('common.confirm') }}</a-button>
        </div>
      </div>
    </template>
  </SunnyModal>
</template>

<style scoped>
.sunny-search-modal-layout :deep(.arco-form) {
  margin-bottom: 0;
}
</style>