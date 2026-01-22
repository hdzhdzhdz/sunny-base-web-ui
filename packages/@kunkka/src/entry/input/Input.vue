<template>
  <a-input
    v-bind="$attrs"
    :model-value="modelValue"
    @update:modelValue="handleUpdateValue"
    @input="handleInput"
  >
    <template v-for="(_, slot) in $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>

    <!-- 如果有规则，且开启了显示图标，则在后缀显示提示 -->
    <template #suffix v-if="shouldShowTip">
      <!-- 优先显示用户自定义的 suffix 插槽 -->
      <slot name="suffix" v-if="$slots.suffix"></slot>
      
      <!-- 否则显示提示图标 -->
      <a-tooltip :content="tipMessage">
        <span class="cursor-help text-[var(--color-text-3)] hover:text-[var(--color-primary-6)] transition-colors ml-1 flex items-center">
          <icon-info-circle />
        </span>
      </a-tooltip>
    </template>
  </a-input>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IconInfoCircle } from "@arco-design/web-vue/es/icon";
import { patterns, getPattern } from "@utils";
import type { KunkkaInputProps } from "./types";

defineOptions({
  name: "KunkkaInput",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<KunkkaInputProps>(), {
  modelValue: "",
  showTipIcon: true,
});

const emit = defineEmits(["update:modelValue", "input"]);

// 获取当前生效的规则配置
const currentPattern = computed(() => {
  if (props.rule) {
    return getPattern(props.rule);
  }
  return null;
});

// 计算提示信息
const tipMessage = computed(() => {
  if (props.tip) return props.tip;
  if (currentPattern.value) return currentPattern.value.message;
  return "";
});

// 是否应该显示提示图标
const shouldShowTip = computed(() => {
  if (!props.showTipIcon) return false;
  // 如果提供了 regex 或 rule，或者提供了 tip，都显示
  return !!(props.regex || props.rule || props.tip);
});

const handleUpdateValue = (val: string) => {
  let finalVal = val;
  const pattern = currentPattern.value as any;
  if (pattern && typeof pattern.filter === 'function') {
    finalVal = pattern.filter(val);
  }
  emit("update:modelValue", finalVal);
};

const handleInput = (val: string) => {
  emit("input", val);
};
</script>
