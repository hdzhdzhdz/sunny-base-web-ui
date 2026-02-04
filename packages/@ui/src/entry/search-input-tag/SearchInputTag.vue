<template>
  <a-input-tag
    v-bind="$attrs"
    :model-value="displayTags"
    :input-value="''"
    :disabled="disabled"
    :placeholder="placeholder"
    :max-tag-count="maxTagCount"
    :allow-create="false"
    class="w-full group"
    @remove="handleRemove"
    @clear="handleClear"
    @keydown="handleKeyDown"
  >
    <template #suffix>
      <div 
        class="flex items-center h-full px-2 border-l border-[var(--color-neutral-3)] group-hover:border-[var(--color-neutral-4)] -mr-3"
        :class="[
          disabled ? 'cursor-not-allowed text-[var(--color-text-4)]' : 'cursor-pointer text-[var(--color-text-2)] group'
        ]"
        @click.stop="handleSearch"
      >
        <icon-search class="transition-colors group-hover:text-[var(--color-primary-6)]" />
      </div>
    </template>
    <template v-for="(_, slot) in $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>
  </a-input-tag>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IconSearch } from "@arco-design/web-vue/es/icon";
import type { SearchInputTagProps } from "./types";

defineOptions({
  name: "SunnySearchInputTag",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<SearchInputTagProps>(), {
  modelValue: () => [],
  fieldNames: () => ({ label: "label", value: "value" }),
  placeholder: "请选择...",
  disabled: false,
});

const emit = defineEmits(["update:modelValue", "search", "change", "clear"]);

// 获取配置的字段名，提供默认值
const labelKey = computed(() => props.fieldNames?.label || "label");
const valueKey = computed(() => props.fieldNames?.value || "value");

// 将 modelValue (对象数组) 转换为 InputTag 需要的格式
const displayTags = computed(() => {
  return props.modelValue.map((item) => ({
    label: item[labelKey.value],
    value: item[valueKey.value],
    closable: !props.disabled,
    tagProps: item.tagProps, // 透传可能存在的 tagProps
  }));
});

// 处理键盘事件：禁止输入，但允许删除
const handleKeyDown = (e: KeyboardEvent) => {
  if (props.disabled) return;

  // 允许的按键：删除、Tab、方向键
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
  if (allowedKeys.includes(e.key)) return;

  // 其他按键全部阻止默认行为（禁止输入）
  e.preventDefault();
};

// 处理标签移除
const handleRemove = (removedTag: any, index: number) => {
  const newValue = [...props.modelValue];
  newValue.splice(index, 1);
  emit("update:modelValue", newValue);
  emit("change", newValue);
};

// 处理清空
const handleClear = () => {
  emit("update:modelValue", []);
  emit("change", []);
  emit("clear");
};

// 处理搜索/选择按钮点击
const handleSearch = () => {
  if (props.disabled) return;
  emit("search");
};
</script>
