import { acceptHMRUpdate, defineStore } from 'pinia';
import { applyPrimaryColor } from '@sunny-base-web/utils';

interface SettingsState {
  /**
   * 字体大小 (px)
   */
  fontSize: number;
  /**
   * 主题色 (hex 格式)
   */
  primaryColor: string;
}

// 字体大小选项
export const FONT_SIZE_OPTIONS = [
  { label: '小', value: 12 },
  { label: '中', value: 14 },
  { label: '大', value: 16 },
  { label: '特大', value: 18 },
] as const;

// 预设主题色选项
export const PRIMARY_COLOR_PRESETS = [
  { label: '极光蓝', value: '#165DFF' },
  { label: '极光绿', value: '#00B42A' },
  { label: '紫罗兰', value: '#722ED1' },
  { label: '日暮橙', value: '#FF7D00' },
  { label: '中国红', value: '#F53F3F' },
  { label: '青碧色', value: '#0FC6C2' },
  { label: '粉红色', value: '#F5319D' },
  { label: '深邃蓝', value: '#2F4F4F' },
] as const;

// 默认字体大小
const DEFAULT_FONT_SIZE = 14;
// 默认主题色
const DEFAULT_PRIMARY_COLOR = '#165DFF';

/**
 * 应用字体大小到 DOM
 */
const applyFontSize = (size: number) => {
  document.documentElement.style.fontSize = `${size}px`;
};

/**
 * 设置 Store
 */
export const useSettingsStore = defineStore('core-settings', {
  state: (): SettingsState => ({
    fontSize: DEFAULT_FONT_SIZE,
    primaryColor: DEFAULT_PRIMARY_COLOR,
  }),

  getters: {
    /**
     * 获取字体大小选项的索引
     */
    fontSizeIndex: (state) => {
      const index = FONT_SIZE_OPTIONS.findIndex((opt) => opt.value === state.fontSize);
      return index >= 0 ? index : 1; // 默认返回"中"
    },

    /**
     * 获取字体大小标签
     */
    fontSizeLabel: (state) => {
      const option = FONT_SIZE_OPTIONS.find((opt) => opt.value === state.fontSize);
      return option?.label || '中';
    },
  },

  actions: {
    /**
     * 设置字体大小
     */
    setFontSize(size: number) {
      this.fontSize = size;
      applyFontSize(size);
    },

    /**
     * 设置主题色
     */
    setPrimaryColor(color: string) {
      this.primaryColor = color;
      applyPrimaryColor(color);
    },

    /**
     * 重置为默认设置
     */
    resetSettings() {
      this.fontSize = DEFAULT_FONT_SIZE;
      this.primaryColor = DEFAULT_PRIMARY_COLOR;
      applyFontSize(DEFAULT_FONT_SIZE);
      applyPrimaryColor(DEFAULT_PRIMARY_COLOR);
    },

    /**
     * 初始化设置（从持久化数据恢复）
     */
    initSettings() {
      // 应用当前字体大小
      applyFontSize(this.fontSize);
      // 应用当前主题色
      applyPrimaryColor(this.primaryColor);
    },
  },

  // 持久化配置
  persist: {
    key: 'sunny-settings',
    pick: ['fontSize', 'primaryColor'],
  },
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useSettingsStore, hot));
}
