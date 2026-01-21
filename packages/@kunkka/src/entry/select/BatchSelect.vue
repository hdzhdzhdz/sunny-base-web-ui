<template>
  <a-select
    v-bind="$attrs"
    :model-value="modelValue"
    :options="options"
    multiple
    allow-search
    @update:modelValue="handleUpdateValue"
    @paste="handlePaste"
  >
    <template #header>
      <div class="flex items-center justify-between px-3 py-2 border-b border-[var(--color-neutral-3)] bg-[var(--color-bg-popup)] select-none">
        <a-checkbox
          :model-value="isAllSelected"
          :indeterminate="isIndeterminate"
          @change="handleSelectAll"
          class="pl-1"
        >
          <span class="text-[var(--color-text-1)]">全选</span>
        </a-checkbox>
        <div class="flex items-center gap-1">
          <a-tooltip content="清除所有选中项">
            <div 
              class="w-6 h-6 flex items-center justify-center rounded cursor-pointer text-[var(--color-text-3)] hover:bg-[var(--color-fill-3)] transition-all"
              @click="handleClearAll"
            >
              <icon-delete />
            </div>
          </a-tooltip>
          <div class="w-[1px] h-3 bg-[var(--color-neutral-3)] mx-1"></div>
          <a-tooltip content="支持从 Excel 或文本编辑器(↓列数据)复制多行数据，粘贴至搜索框即可自动匹配并选中。" position="left">
            <div class="w-6 h-6 flex items-center justify-center rounded cursor-help text-[var(--color-text-3)] hover:text-[var(--color-text-1)] hover:bg-[var(--color-fill-3)] transition-all">
              <icon-question-circle />
            </div>
          </a-tooltip>
        </div>
      </div>
    </template>
    <template v-for="(_, slot) in $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>
  </a-select>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Message } from "@arco-design/web-vue";
import { IconDelete, IconQuestionCircle } from "@arco-design/web-vue/es/icon";
import type { BatchSelectProps } from "./types";

const props = withDefaults(defineProps<BatchSelectProps>(), {
  modelValue: () => [],
  options: () => [],
  matchStrategy: 'both',
});

const emit = defineEmits(["update:modelValue", "change"]);

// 过滤出未禁用的选项 (Filter enabled options)
const enabledOptions = computed(() =>
  props.options.filter((opt) => !opt.disabled)
);

// 是否全选 (Is all selected)
const isAllSelected = computed(() => {
  if (enabledOptions.value.length === 0) return false;
  return enabledOptions.value.every((opt) =>
    props.modelValue.includes(opt.value)
  );
});

// 半选状态 (Indeterminate state)
const isIndeterminate = computed(() => {
  if (enabledOptions.value.length === 0) return false;
  const selectedCount = enabledOptions.value.filter((opt) =>
    props.modelValue.includes(opt.value)
  ).length;
  return selectedCount > 0 && selectedCount < enabledOptions.value.length;
});

// 更新值 (Update value)
const handleUpdateValue = (val: (string | number)[]) => {
  emit("update:modelValue", val);
  emit("change", val);
};

// 处理全选/取消全选 (Handle select all/deselect all)
const handleSelectAll = (val: boolean | (string | number | boolean)[]) => {
  const checked = val === true;
  if (checked) {
    const allValues = enabledOptions.value.map((opt) => opt.value);
    // 保留已选中的禁用项 (Keep disabled selected items)
    const disabledSelected = props.modelValue.filter(v => {
      const opt = props.options.find(o => o.value === v);
      return opt && opt.disabled;
    });
    const newValues = Array.from(new Set([...disabledSelected, ...allValues]));
    emit("update:modelValue", newValues);
    emit("change", newValues);
  } else {
    // 仅保留禁用项 (Keep only disabled items)
    const disabledSelected = props.modelValue.filter(v => {
      const opt = props.options.find(o => o.value === v);
      return opt && opt.disabled;
    });
    emit("update:modelValue", disabledSelected);
    emit("change", disabledSelected);
  }
};

// 清除所有 (Clear all)
const handleClearAll = () => {
  const disabledSelected = props.modelValue.filter(v => {
    const opt = props.options.find(o => o.value === v);
    return opt && opt.disabled;
  });
  emit("update:modelValue", disabledSelected);
  emit("change", disabledSelected);
};

// 处理粘贴 (Handle paste)
const handlePaste = (e: ClipboardEvent) => {
  const clipboardData = e.clipboardData || (window as any).clipboardData;
  if (!clipboardData) return;

  const text = clipboardData.getData("text");
  if (!text) return;

  // 按换行符分割并去除首尾空格 (Split by newline and trim)
  const items = text
    .split(/\r?\n/)
    .map((item: string) => item.trim())
    .filter((item: string) => item);

  if (items.length === 0) return;

  const newSelectedValues: (string | number)[] = [];
  let matchCount = 0;

  items.forEach((item: string) => {
    // 策略：匹配值 (Strategy: Match Value)
    if (props.matchStrategy === 'value' || props.matchStrategy === 'both') {
      const valueMatch = props.options.find(opt => String(opt.value) === item);
      if (valueMatch && !valueMatch.disabled) {
        newSelectedValues.push(valueMatch.value);
        matchCount++;
        return;
      }
    }

    // 策略：匹配标签 (Strategy: Match Label)
    if (props.matchStrategy === 'label' || props.matchStrategy === 'both') {
      const labelMatch = props.options.find(opt => opt.label === item);
      if (labelMatch && !labelMatch.disabled) {
        newSelectedValues.push(labelMatch.value);
        matchCount++;
      }
    }
  });

  if (newSelectedValues.length > 0) {
    e.preventDefault(); // 阻止默认粘贴 (Prevent default paste)
    
    const finalValues = Array.from(new Set([...props.modelValue, ...newSelectedValues]));
    emit("update:modelValue", finalValues);
    emit("change", finalValues);
    
    Message.success(`成功识别并选中 ${matchCount} 项 (Matched ${matchCount} items)`);
  }
};
</script>
