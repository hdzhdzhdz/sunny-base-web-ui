<template>
  <div class="sunny-business-search w-full">
    <SunnySearchInputTag v-bind="$attrs" :model-value="selectedValues" :placeholder="placeholder" :disabled="disabled"
      :max-tag-count="maxTagCount" :field-names="mergedFieldNames" @update:model-value="val => selectedValues = val"
      @search="handleOpen">
      <!-- 透传 slot -->
      <template v-for="(_value, slot) of ($slots as Record<string, any>)" #[slot]="scope">
        <slot :name="slot" v-bind="scope || {}"></slot>
      </template>
    </SunnySearchInputTag>

    <SunnySearchModal v-if="currentConfig.title || visible" v-model:visible="visible" :model-value="selectedValues"
      v-bind="mergedModalProps" @confirm="handleConfirm" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SunnySearchInputTag } from '../../entry/search-input-tag';
import { SunnySearchModal } from '../../feedback/search-modal';
import { useSunnyBusinessSearch } from './use-sunny-business-search';
import type { SunnyBusinessSearchProps } from './types';

defineOptions({
  name: 'SunnyBusinessSearch',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<SunnyBusinessSearchProps>(), {
  modelValue: () => [],
  placeholder: '请选择',
  multiple: undefined,
  disabled: false,
  modalProps: () => ({}),
});

const emit = defineEmits(['update:modelValue', 'change']);

const {
  visible,
  currentConfig,
  selectedValues,
  handleOpen,
  handleConfirm
} = useSunnyBusinessSearch(props, emit as any);

// 合并 fieldNames
// 优先级: props.fieldNames > props.modalProps.fieldNames > currentConfig.fieldNames > 默认值
const mergedFieldNames = computed(() => {
  return props.fieldNames
    || props.modalProps?.fieldNames
    || currentConfig.value.fieldNames
    || { label: 'label', value: 'value' };
});

// 合并配置
const mergedModalProps = computed(() => {
  // 优先级: props.modalProps.multiple > props.multiple > props.cSelectionMode > currentConfig.multiple > default(true)
  let baseMultiple = props.modalProps?.multiple;

  if (baseMultiple === undefined) {
    baseMultiple = props.multiple;
  }

  if (baseMultiple === undefined && props.cSelectionMode) {
    baseMultiple = props.cSelectionMode !== 'single';
  }

  baseMultiple = baseMultiple ?? currentConfig.value.multiple ?? true;

  // 处理表格列，自动注入选择列
  const rawColumns = props.modalProps.tableColumns || currentConfig.value.tableColumns || [];
  let tableColumns = [...rawColumns];

  // 检查是否已存在选择列
  const hasSelectionCol = tableColumns.some((col: any) => col.type === 'checkbox' || col.type === 'radio');

  if (!hasSelectionCol && tableColumns.length > 0) {
    if (baseMultiple) {
      tableColumns.unshift({ type: 'checkbox', width: 50, fixed: 'left', align: 'center' });
    } else {
      tableColumns.unshift({ type: 'radio', width: 50, fixed: 'left', align: 'center' });
    }
  }

  return {
    ...currentConfig.value,
    multiple: baseMultiple,
    fieldNames: mergedFieldNames.value,
    defaultModel: props.defaultModel || currentConfig.value.defaultModel,
    ...props.modalProps, // 用户传入的 modalProps 优先级最高
    tableColumns, // 覆盖处理后的 columns
  };
});
</script>
