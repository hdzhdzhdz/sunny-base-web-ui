import { defineStore } from 'pinia';
import { applyPrimaryColor } from '@sunny-base-web/utils';
import { VXETable } from 'vxe-table';

interface SettingsState {
  /**
   * 字体大小 (px)
   */
  fontSize: number;
  /**
   * 主题色 (hex 格式)
   */
  primaryColor: string;
  /**
   * 表格行高 (px)
   */
  tableRowHeight: number;
}

// 字体大小选项
export const FONT_SIZE_OPTIONS = [
  { label: '小', value: 12 },
  { label: '中', value: 14 },
  { label: '大', value: 16 },
  { label: '特大', value: 18 },
] as const;

// 表格行高选项
export const TABLE_ROW_HEIGHT_OPTIONS = [
  { label: '紧凑', value: 32 },
  { label: '默认', value: 40 },
  { label: '宽松', value: 48 },
  { label: '超大', value: 56 },
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
// 默认表格行高
const DEFAULT_TABLE_ROW_HEIGHT = 40;

/**
 * 应用字体大小到 DOM
 */
const applyFontSize = (size: number) => {
  document.documentElement.style.fontSize = `${size}px`;
};

/**
 * 应用表格行高到 DOM (vxe-table CSS 变量 + 全局配置)
 * 同时设置所有尺寸的行高，确保无论表格使用哪个 size 都能生效
 */
const applyTableRowHeight = (height: number) => {
  const root = document.documentElement;
  // 设置所有尺寸的行高 CSS 变量
  root.style.setProperty('--vxe-ui-table-row-height-default', `${height}px`);
  root.style.setProperty('--vxe-ui-table-row-height-medium', `${height}px`);
  root.style.setProperty('--vxe-ui-table-row-height-small', `${height}px`);
  root.style.setProperty('--vxe-ui-table-row-height-mini', `${height}px`);

  // 同时更新 VXETable 全局配置（影响新创建的表格）
  VXETable.setup({
    table: {
      rowHeight: height,
    }
  });
};

/**
 * 设置 Store
 */
export const useSettingsStore = defineStore('core-settings', {
  state: (): SettingsState => ({
    fontSize: DEFAULT_FONT_SIZE,
    primaryColor: DEFAULT_PRIMARY_COLOR,
    tableRowHeight: DEFAULT_TABLE_ROW_HEIGHT,
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

    /**
     * 获取表格行高选项的索引
     */
    tableRowHeightIndex: (state) => {
      const index = TABLE_ROW_HEIGHT_OPTIONS.findIndex((opt) => opt.value === state.tableRowHeight);
      return index >= 0 ? index : 1; // 默认返回"默认"
    },

    /**
     * 获取表格行高标签
     */
    tableRowHeightLabel: (state) => {
      const option = TABLE_ROW_HEIGHT_OPTIONS.find((opt) => opt.value === state.tableRowHeight);
      return option?.label || '默认';
    },
  },

  actions: {
    /**
     * 设置字体大小
     */
    setFontSize(size: number) {
      const validSizes = FONT_SIZE_OPTIONS.map(opt => opt.value);
      if (!validSizes.includes(size as any)) {
        console.warn(`Invalid font size: ${size}, using default`);
        size = DEFAULT_FONT_SIZE;
      }
      this.fontSize = size;
      applyFontSize(size);
    },


    /**
     * 设置主题色
     */
    setPrimaryColor(color: string) {
      // 验证颜色格式
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        console.warn(`Invalid primary color format: ${color}, expected hex format like #165DFF`);
        return;
      }
      this.primaryColor = color;
      applyPrimaryColor(color);
    },

    /**
     * 设置表格行高
     */
    setTableRowHeight(height: number) {
      this.tableRowHeight = height;
      applyTableRowHeight(height);
    },

    /**
     * 重置为默认设置
     */
    resetSettings() {
      this.fontSize = DEFAULT_FONT_SIZE;
      this.primaryColor = DEFAULT_PRIMARY_COLOR;
      this.tableRowHeight = DEFAULT_TABLE_ROW_HEIGHT;
      applyFontSize(DEFAULT_FONT_SIZE);
      applyPrimaryColor(DEFAULT_PRIMARY_COLOR);
      applyTableRowHeight(DEFAULT_TABLE_ROW_HEIGHT);
    },

    /**
     * 初始化设置（从持久化数据恢复）
     */
    initSettings() {
      // 应用当前字体大小
      applyFontSize(this.fontSize);
      // 应用当前主题色
      applyPrimaryColor(this.primaryColor);
      // 应用当前表格行高
      applyTableRowHeight(this.tableRowHeight);
    },
  },

  // 持久化配置
  persist: {
    key: 'sunny-settings',
    pick: ['fontSize', 'primaryColor', 'tableRowHeight'],
  },
});
