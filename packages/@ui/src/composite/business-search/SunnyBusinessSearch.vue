<template>
  <div class="sunny-business-search">
    <SunnySearchInputTag
      v-bind="$attrs"
      :model-value="selectedValues"
      :placeholder="placeholder"
      :disabled="disabled"
      :max-tag-count="maxTagCount"
      :field-names="currentConfig.fieldNames"
      @update:model-value="val => selectedValues = val"
      @search="handleOpen"
    >
      <!-- 透传 slot -->
      <template v-for="(_, slot) in $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope || {}"></slot>
      </template>
    </SunnySearchInputTag>

    <SunnySearchModal
      v-if="currentConfig.title || visible"
      v-model:visible="visible"
      :model-value="selectedValues"
      v-bind="mergedModalProps"
      @confirm="handleConfirm"
    />
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
  multiple: true,
  disabled: false,
  modalProps: () => ({}),
});

const emit = defineEmits(['update:modelValue', 'change']);

const {
  visible,
  loading,
  currentConfig,
  selectedValues,
  handleOpen,
  handleConfirm
} = useSunnyBusinessSearch(props, emit);

// 合并配置
const mergedModalProps = computed(() => {
  return {
    multiple: props.multiple,
    ...currentConfig.value,
    ...props.modalProps, // 用户传入的 modalProps 优先级最高
  };
});
</script>
