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
    <div class="space-y-6" @click="colorPickerVisible = false">
      <!-- 主题色设置 -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-[var(--color-text-1)]">主题色</span>
        </div>

        <!-- 颜色选择器 -->
        <div class="flex items-center gap-4" @click.stop>
          <a-color-picker
            v-model="tempPrimaryColor"
            v-model:popup-visible="colorPickerVisible"
            format="hex"
            showText
            showPreset
          />
        </div>
      </div>

      <!-- 分割线 -->
      <a-divider class="!my-4" />

      <!-- 主题色预览效果 -->
      <div class="space-y-2">
        <span class="text-sm font-medium text-[var(--color-text-1)]">主题色预览</span>
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

      <!-- 分割线 -->
      <a-divider class="!my-4" />

      <!-- 表格行高设置 -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-[var(--color-text-1)]">表格行高</span>
          <span class="text-xs text-[var(--color-text-3)]">{{ currentRowHeightLabel }} ({{ tempTableRowHeight }}px)</span>
        </div>

        <!-- 提示信息 -->
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--color-primary-1)] text-xs text-[var(--color-text-3)]">
          <IconInfoCircle />
          <span>修改后需刷新页面生效</span>
        </div>

        <div class="flex justify-center gap-2">
          <a-button
            v-for="opt in TABLE_ROW_HEIGHT_OPTIONS"
            :key="opt.value"
            :type="tempTableRowHeight === opt.value ? 'primary' : 'text'"
            size="small"
            @click="tempTableRowHeight = opt.value"
          >
            {{ opt.label }}
          </a-button>
        </div>

        <!-- 预览效果 -->
        <div class="space-y-2 mt-3">
          <div
            class="p-3 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-fill-1)]"
          >
            <div class="overflow-hidden">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--color-border-2)]">
                    <th class="text-left py-2 font-medium">列1</th>
                    <th class="text-left py-2 font-medium">列2</th>
                    <th class="text-left py-2 font-medium">列3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="i in 3"
                    :key="i"
                    class="border-b border-[var(--color-border-1)] last:border-0"
                    :style="{ height: `${tempTableRowHeight}px` }"
                  >
                    <td class="py-1">数据 {{ i }}-1</td>
                    <td class="py-1">数据 {{ i }}-2</td>
                    <td class="py-1">数据 {{ i }}-3</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Modal } from '@sunny-base-web/ui';
import { useSettingsStore, TABLE_ROW_HEIGHT_OPTIONS } from '@sunny-base-web/stores';
import { IconInfoCircle } from '@arco-design/web-vue/es/icon';

defineOptions({ name: 'SettingsModal' });

const settingsStore = useSettingsStore();
const visible = ref(false);
const loading = ref(false);

// 临时主题色（用于预览）
const tempPrimaryColor = ref(settingsStore.primaryColor);
// 颜色选择器弹窗状态
const colorPickerVisible = ref(false);
// 临时表格行高（用于预览）
const tempTableRowHeight = ref(settingsStore.tableRowHeight);

// 当前行高标签
const currentRowHeightLabel = computed(() => {
  const option = TABLE_ROW_HEIGHT_OPTIONS.find(opt => opt.value === tempTableRowHeight.value);
  return option?.label || '默认';
});

/**
 * 打开弹窗
 */
const open = () => {
  tempPrimaryColor.value = settingsStore.primaryColor;
  tempTableRowHeight.value = settingsStore.tableRowHeight;
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
    // 保存表格行高设置
    settingsStore.setTableRowHeight(tempTableRowHeight.value);
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
