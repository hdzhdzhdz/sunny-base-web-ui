<!--
  * 设置弹窗
  * 提供显示设置功能
-->
<template>
  <Modal
    v-model="visible"
    title="显示设置"
    :width="480"
    :fullscreen="false"
    :ok-loading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="space-y-6">
      <!-- 字体大小设置 -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-[var(--color-text-1)]">字体大小</span>
          <span class="text-xs text-[var(--color-text-3)]">{{ currentLabel }} ({{ currentSize }}px)</span>
        </div>

        <!-- 滑块 -->
        <div class="flex items-center gap-4">
          <span class="text-xs text-[var(--color-text-4)] w-6">Aa</span>
          <a-slider
            v-model="fontSizeIndex"
            :min="0"
            :max="FONT_SIZE_OPTIONS.length - 1"
            :step="1"
            :marks="sliderMarks"
            class="flex-1"
            @change="handleSliderChange"
          />
          <span class="text-lg text-[var(--color-text-4)] w-8">Aa</span>
        </div>

        <!-- 快捷选项 -->
        <div class="flex justify-center gap-2">
          <a-button
            v-for="opt in FONT_SIZE_OPTIONS"
            :key="opt.value"
            :type="tempFontSize === opt.value ? 'primary' : 'text'"
            size="small"
            @click="tempFontSize = opt.value"
          >
            {{ opt.label }}
          </a-button>
        </div>
      </div>

      <!-- 分割线 -->
      <a-divider class="!my-4" />

      <!-- 预览效果 -->
      <div class="space-y-2">
        <span class="text-sm font-medium text-[var(--color-text-1)]">预览效果</span>
        <div
          class="p-4 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-fill-1)] transition-all duration-200"
          :style="{ fontSize: `${tempFontSize}px` }"
        >
          <div class="space-y-2">
            <p class="font-medium">这是一段预览文字</p>
            <p class="text-[var(--color-text-3)]">
              用来展示当前字体大小效果，调整上方滑块可以实时预览。
            </p>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Modal } from '@sunny-base-web/ui';
import { useSettingsStore, FONT_SIZE_OPTIONS } from '@sunny-base-web/stores';

defineOptions({ name: 'SettingsModal' });

const settingsStore = useSettingsStore();
const visible = ref(false);
const loading = ref(false);

// 临时字体大小（用于预览）
const tempFontSize = ref(settingsStore.fontSize);

// 当前字体大小索引
const fontSizeIndex = ref(settingsStore.fontSizeIndex);

// 滑块标记 - Arco Design 格式为对象 { [position]: label }
const sliderMarks = computed<Record<number, string>>(() => {
  const marks: Record<number, string> = {};
  FONT_SIZE_OPTIONS.forEach((opt, index) => {
    marks[index] = opt.label;
  });
  return marks;
});

// 计算当前选项
const currentLabel = computed(() => {
  const option = FONT_SIZE_OPTIONS.find((opt) => opt.value === tempFontSize.value);
  return option?.label || '中';
});

const currentSize = computed(() => tempFontSize.value);

// 监听滑块变化
const handleSliderChange = (value: number | number[]) => {
  const index = Array.isArray(value) ? value[0] : value;
  tempFontSize.value = FONT_SIZE_OPTIONS[index].value;
};

// 监听临时字体大小变化，更新滑块索引
watch(tempFontSize, (val) => {
  const index = FONT_SIZE_OPTIONS.findIndex((opt) => opt.value === val);
  if (index >= 0) {
    fontSizeIndex.value = index;
  }
});

/**
 * 打开弹窗
 */
const open = () => {
  tempFontSize.value = settingsStore.fontSize;
  fontSizeIndex.value = settingsStore.fontSizeIndex;
  visible.value = true;
};

/**
 * 关闭弹窗
 */
const close = () => {
  visible.value = false;
};

/**
 * 确认提交
 */
const handleOk = async () => {
  loading.value = true;
  try {
    // 保存设置
    settingsStore.setFontSize(tempFontSize.value);
    visible.value = false;
  } finally {
    loading.value = false;
  }
};

/**
 * 取消
 */
const handleCancel = () => {
  close();
};

// 暴露方法
defineExpose({
  open,
  close,
});
</script>

<style scoped>
:deep(.arco-slider-mark) {
  font-size: 12px;
}
</style>
