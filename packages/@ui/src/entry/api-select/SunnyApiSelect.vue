<template>
  <component
    :is="renderComponent"
    v-bind="selectProps"
    :allow-search="props.allowSearch"
    @update:modelValue="handleUpdateValue"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import SunnySelect from '../select/Select';
import SunnyBatchSelect from '../select/BatchSelect.vue';
import { useApiSelect } from './use-api-select';
import type { ApiSelectProps } from './types';

defineOptions({
  name: 'SunnyApiSelect',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ApiSelectProps>(), {
  multiple: false,
  immediate: true,
  placeholder: '请选择',
  allowClear: true,
  showLoading: true,
  clearOptionsWhenEmpty: true,
  allowSearch: false,
  searchField: 'keyword',
  searchDebounce: 300,
});

const emit = defineEmits<{
  'update:modelValue': [value: any];
  'change': [value: any];
  'optionsLoaded': [options: any[]];
  'error': [error: Error];
}>();

const attrs = useAttrs();

const { options, loading, error, isReady, handleSearch } = useApiSelect(props, emit);

const renderComponent = computed(() =>
  props.multiple ? SunnyBatchSelect : SunnySelect
);

const selectProps = computed(() => {
  // 判断是否就绪（考虑 allowSearch 模式）
  const isSearchMode = props.allowSearch;
  const isActuallyReady = isReady.value || isSearchMode;

  return {
    modelValue: props.modelValue,
    options: options.value,
    placeholder: isActuallyReady
      ? props.placeholder
      : `请先选择${props.deps.join('、')}`,
    disabled: props.disabled || (!isSearchMode && !isReady.value) || loading.value,
    allowClear: props.allowClear,
    loading: props.showLoading && loading.value,
    filterable: false, // 关闭本地过滤，使用远程搜索
    ...attrs,
  };
});

const handleUpdateValue = (val: any) => {
  emit('update:modelValue', val);
  emit('change', val);
};

defineExpose({
  options,
  loading,
  error,
  handleSearch,
});
</script>
