<template>
  <div class="flex items-center gap-2 w-full">
    <a-input-tag
      v-bind="$attrs"
      :model-value="displayTags"
      :disabled="disabled"
      :placeholder="placeholder"
      :max-tag-count="maxTagCount"
      readonly
      allow-create="false"
      class="flex-1"
      @remove="handleRemove"
      @clear="handleClear"
    >
      <template v-for="(_, slot) in $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope || {}"></slot>
      </template>
    </a-input-tag>
    <a-button :disabled="disabled" @click="handleSearch">
      <template #icon>
        <icon-search />
      </template>
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IconSearch } from "@arco-design/web-vue/es/icon";
import type { SearchInputTagProps } from "./types";

defineOptions({
  name: "KunkkaSearchInputTag",
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
