import { acceptHMRUpdate, defineStore } from 'pinia';

interface SettingsState {
  /**
   * 字体大小 (px)
   */
  fontSize: number;
}

// 字体大小选项
export const FONT_SIZE_OPTIONS = [
  { label: '小', value: 12 },
  { label: '中', value: 14 },
  { label: '大', value: 16 },
  { label: '特大', value: 18 },
] as const;

// 默认字体大小
const DEFAULT_FONT_SIZE = 14;

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
     * 重置为默认设置
     */
    resetSettings() {
      this.fontSize = DEFAULT_FONT_SIZE;
      applyFontSize(DEFAULT_FONT_SIZE);
    },

    /**
     * 初始化设置（从持久化数据恢复）
     */
    initSettings() {
      // 应用当前字体大小
      applyFontSize(this.fontSize);
    },
  },

  // 持久化配置
  persist: {
    key: 'sunny-settings',
    pick: ['fontSize'],
  },
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useSettingsStore, hot));
}
