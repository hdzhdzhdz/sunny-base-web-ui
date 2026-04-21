<template>
  <a-popover
    v-model:popup-visible="popoverVisible"
    trigger="focus"
    position="bl"
    :unmount-on-close="true"
  >
    <a-input-tag
      ref="inputTagRef"
      v-bind="$attrs"
      :model-value="displayTags"
      :input-value="''"
      :disabled="disabled"
      :placeholder="placeholder"
      :max-tag-count="maxTagCount"
      :allow-create="false"
      class="sunny-search-input-tag w-full group"
      tag-nowrap
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
      <template v-for="(scope, slot) of ($slots as Record<string, any>)" #[slot]="scope">
        <slot :name="slot" v-bind="scope || {}"></slot>
      </template>
    </a-input-tag>

    <template #content>
      <div v-if="displayTags.length > 0" class="max-w-80 flex flex-wrap gap-1.5" @mousedown.prevent>
        <a-tag
          v-for="(item, index) in displayTags"
          :key="item.value"
          :closable="!disabled"
          size="small"
          @close="handleRemove(item, index)"
        >
          {{ item.label }}
        </a-tag>
      </div>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
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

const labelKey = computed(() => props.fieldNames?.label || "label");
const valueKey = computed(() => props.fieldNames?.value || "value");

const displayTags = computed(() => {
  return props.modelValue.map((item) => ({
    label: item[labelKey.value],
    value: item[valueKey.value],
    closable: !props.disabled,
    tagProps: item.tagProps,
  }));
});

// ====== 气泡卡片 ======
const popoverVisible = ref(false);

// tag 清空后自动关闭气泡
watch(
  () => displayTags.value.length,
  (len) => {
    if (len === 0) popoverVisible.value = false;
  }
);

// ====== 事件处理 ======
const handleKeyDown = (e: KeyboardEvent) => {
  if (props.disabled) return;

  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];
  if (allowedKeys.includes(e.key)) return;

  e.preventDefault();
};

const handleRemove = (_: any, index: number) => {
  const newValue = [...props.modelValue];
  newValue.splice(index, 1);
  emit("update:modelValue", newValue);
  emit("change", newValue);
};

const handleClear = () => {
  emit("update:modelValue", []);
  emit("change", []);
  emit("clear");
};

const handleSearch = () => {
  if (props.disabled) return;
  emit("search");
};
</script>

<style>
/* 外层防止撑高 */
.arco-input-tag.sunny-search-input-tag {
  overflow: hidden !important;
}

/* 内层强制单行排列 */
.arco-input-tag.sunny-search-input-tag .arco-input-tag-inner {
  display: flex !important;
  flex-wrap: nowrap !important;
  min-width: 0 !important;
  overflow: hidden !important;
}

/* tag 和 input 不收缩 */
.arco-input-tag.sunny-search-input-tag .arco-input-tag-tag {
  flex-shrink: 0 !important;
}

.arco-input-tag.sunny-search-input-tag .arco-input-tag-input {
  flex-shrink: 0 !important;
}
</style>
