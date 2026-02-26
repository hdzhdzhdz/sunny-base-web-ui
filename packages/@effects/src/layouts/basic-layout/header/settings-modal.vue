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
      <!-- 主题色设置 -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-[var(--color-text-1)]">主题色</span>
        </div>

        <!-- 颜色选择器 -->
        <div class="flex items-center gap-4">
          <a-color-picker
            v-model="tempPrimaryColor"
            format="hex"
            showText
            showPreset
            :historyColors="historyColors"
            @popup-visible-change="handleColorPopupChange"
          />
        </div>
      </div>

      <!-- 分割线 -->
      <a-divider class="!my-4" />

      <!-- 预览效果 -->
      <div class="space-y-2">
        <span class="text-sm font-medium text-[var(--color-text-1)]">预览效果</span>
        <div
          class="p-4 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-fill-1)]"
        >
          <div class="flex items-center gap-4">
            <a-button
              type="primary"
              size="small"
              :style="{ backgroundColor: tempPrimaryColor, borderColor: tempPrimaryColor }"
            >
              主要按钮
            </a-button>
            <a-button
              type="outline"
              size="small"
              :style="{ color: tempPrimaryColor, borderColor: tempPrimaryColor }"
            >
              次要按钮
            </a-button>
            <a-link :style="{ color: tempPrimaryColor }">链接文字</a-link>
          </div>
        </div>
      </div>

      <!-- TODO: 字体大小设置 (暂时注释)
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-[var(--color-text-1)]">字体大小</span>
          <span class="text-xs text-[var(--color-text-3)]">{{ currentLabel }} ({{ currentSize }}px)</span>
        </div>

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

      <a-divider class="!my-4" />

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
      -->
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Modal } from '@sunny-base-web/ui';
import { useSettingsStore } from '@sunny-base-web/stores';

defineOptions({ name: 'SettingsModal' });

const settingsStore = useSettingsStore();
const visible = ref(false);
const loading = ref(false);

// 临时主题色（用于预览）
const tempPrimaryColor = ref(settingsStore.primaryColor);

// 历史颜色（用于颜色选择器的 historyColors）
const historyColors = ref<string[]>([]);

/**
 * 颜色选择器弹出状态变化
 */
const handleColorPopupChange = (visible: boolean) => {
  // 关闭时添加到历史颜色
  if (!visible && tempPrimaryColor.value) {
    const index = historyColors.value.indexOf(tempPrimaryColor.value);
    if (index !== -1) {
      historyColors.value.splice(index, 1);
    }
    historyColors.value.unshift(tempPrimaryColor.value);
    // 最多保留 8 个历史颜色
    if (historyColors.value.length > 8) {
      historyColors.value.pop();
    }
  }
};

/**
 * 打开弹窗
 */
const open = () => {
  tempPrimaryColor.value = settingsStore.primaryColor;
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
    // 保存主题色设置
    settingsStore.setPrimaryColor(tempPrimaryColor.value);
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
