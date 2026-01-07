import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * 设置相关的状态接口定义
 */
export interface SettingsState {
  // 字体大小设置
  fontSize: number;
  // 主题设置
  theme: "light" | "dark";
  // 侧边栏设置
  sider: {
    // 侧边栏宽度
    width: number;
    // 收起宽度
    collapsedWidth: number;
    // 头部高度
    headerHeight: number;
    // 底部高度
    footerHeight: number;
  };
  // 菜单设置
  menu: {
    // 子菜单背景色
    subMenuItemBg: string;
    // 菜单项悬浮背景色
    itemHoverBg: string;
  };
}

/**
 * 初始状态
 */
export const initialState: SettingsState = {
  fontSize: 14,
  theme: "light",
  sider: {
    width: 224,
    collapsedWidth: 50,
    headerHeight: 50,
    footerHeight: 32,
  },
  menu: {
    subMenuItemBg: "#ffffff",
    itemHoverBg: "rgb(244, 244, 245)",
  },
};

/**
 * Settings Slice
 * 用于管理应用全局设置的状态片段
 */
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    /**
     * 设置字体大小
     * @param state 当前状态
     * @param action 包含新的字体大小数值
     */
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload;
    },
    /**
     * 设置主题
     * @param state 当前状态
     * @param action 包含新的主题模式
     */
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    /**
     * 更新侧边栏设置
     * @param state
     * @param action
     */
    updateSider: (
      state,
      action: PayloadAction<Partial<SettingsState["sider"]>>
    ) => {
      state.sider = { ...state.sider, ...action.payload };
    },
  },
});

// 导出 Actions
export const { setFontSize, setTheme, updateSider } = settingsSlice.actions;

// 导出 Reducer
export default settingsSlice.reducer;
