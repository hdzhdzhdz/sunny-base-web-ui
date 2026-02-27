import { TinyColor } from "@ctrl/tinycolor";

function isValidColor(color?: string) {
  if (!color) {
    return false;
  }
  return new TinyColor(color).isValid;
}

/**
 * 根据主色生成 Arco Design 主题色色阶
 * @param primaryColor 主色（hex 格式，如 #165DFF）
 * @returns 包含 1-10 色阶的对象，值为 RGB 字符串（如 "22,93,255"）
 */
function generatePrimaryColors(primaryColor: string): Record<string, string> {
  const base = new TinyColor(primaryColor);

  if (!base.isValid) {
    console.warn('Invalid primary color:', primaryColor);
    return {};
  }

  const colors: Record<string, string> = {};

  // Arco Design 色阶规则：
  // 1-5: 逐渐变浅（用于背景）
  // 6: 主色
  // 7-10: 逐渐变深（用于 hover/active）
  const lightLevels = [95, 85, 70, 50, 30]; // 1-5 的混合白色百分比
  const darkLevels = [10, 20, 30, 40]; // 7-10 的混合黑色百分比

  // 生成 1-5（浅色）
  lightLevels.forEach((level, index) => {
    const color = base.tint(level);
    const rgb = color.toRgb();
    const rgbValue = `${rgb.r},${rgb.g},${rgb.b}`;
    const i = index + 1;
    colors[`primary-${i}`] = rgbValue;
    colors[`arcoblue-${i}`] = rgbValue;
    // 同时设置 color-primary-light 变量
    colors[`color-primary-light-${4 - index}`] = rgbValue;
  });

  // 6 为主色
  const mainRgb = base.toRgb();
  const mainRgbValue = `${mainRgb.r},${mainRgb.g},${mainRgb.b}`;
  colors['primary-6'] = mainRgbValue;
  colors['arcoblue-6'] = mainRgbValue;

  // 生成 7-10（深色）
  darkLevels.forEach((level, index) => {
    const color = base.shade(level);
    const rgb = color.toRgb();
    const rgbValue = `${rgb.r},${rgb.g},${rgb.b}`;
    const i = index + 7;
    colors[`primary-${i}`] = rgbValue;
    colors[`arcoblue-${i}`] = rgbValue;
  });

  return colors;
}

/**
 * 应用主题色到页面（Arco Design + VxeTable）
 * @param primaryColor 主色（hex 格式）
 */
function applyPrimaryColor(primaryColor: string): void {
  const colors = generatePrimaryColors(primaryColor);

  // Arco Design 的 CSS 变量定义在 body 上，所以需要同时设置 body 和 html
  const root = document.documentElement;
  const body = document.body;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
    if (body) {
      body.style.setProperty(`--${key}`, value);
    }
  });

  // 同步设置 VxeTable 的主题色变量
  applyVxeTableTheme(primaryColor, root, body);

  // 打印调试信息
  console.log('已应用主题色:', primaryColor, colors);
}

/**
 * 应用 VxeTable 主题色
 * @param primaryColor 主色（hex 格式）
 * @param root document.documentElement
 * @param body document.body
 */
function applyVxeTableTheme(primaryColor: string, root: HTMLElement, body: HTMLElement | null): void {
  const base = new TinyColor(primaryColor);

  if (!base.isValid) {
    return;
  }

  // ==================== VxeTable 核心主色变量 ====================
  // 用于图标、按钮 hover、选中状态等
  root.style.setProperty('--vxe-ui-font-primary-color', primaryColor);
  body?.style.setProperty('--vxe-ui-font-primary-color', primaryColor);

  // ==================== Vxe-PC-UI 主色衍生变量 ====================
  // 主色浅色调（用于背景）
  const primaryTinge = base.tint(85).toHexString();
  root.style.setProperty('--vxe-ui-font-primary-tinge-color', primaryTinge);
  body?.style.setProperty('--vxe-ui-font-primary-tinge-color', primaryTinge);

  // 主色浅色（用于 hover 文字）
  const primaryLighten = base.tint(30).toHexString();
  root.style.setProperty('--vxe-ui-font-primary-lighten-color', primaryLighten);
  body?.style.setProperty('--vxe-ui-font-primary-lighten-color', primaryLighten);

  // 主色深色（用于 active 文字）
  const primaryDarken = base.shade(15).toHexString();
  root.style.setProperty('--vxe-ui-font-primary-darken-color', primaryDarken);
  body?.style.setProperty('--vxe-ui-font-primary-darken-color', primaryDarken);

  // 主色禁用状态
  const primaryDisabled = base.tint(50).toHexString();
  root.style.setProperty('--vxe-ui-font-primary-disabled-color', primaryDisabled);
  body?.style.setProperty('--vxe-ui-font-primary-disabled-color', primaryDisabled);

  // 主色 hover 背景色
  const primaryHoverBg = base.tint(90).toHexString();
  root.style.setProperty('--vxe-ui-font-primary-hover-color', primaryHoverBg);
  body?.style.setProperty('--vxe-ui-font-primary-hover-color', primaryHoverBg);

  // ==================== 基础交互色 ====================
  // 拖拽背景色
  root.style.setProperty('--vxe-ui-base-drag-background-color', primaryTinge);
  body?.style.setProperty('--vxe-ui-base-drag-background-color', primaryTinge);

  // 激活背景色
  root.style.setProperty('--vxe-ui-base-active-background-color', primaryTinge);
  body?.style.setProperty('--vxe-ui-base-active-background-color', primaryTinge);

  // ==================== 菜单相关 ====================
  // 菜单项 hover 颜色
  root.style.setProperty('--vxe-ui-menu-item-hover-color', primaryColor);
  body?.style.setProperty('--vxe-ui-menu-item-hover-color', primaryColor);

  // ==================== 树形相关 ====================
  // 树节点当前行背景色
  root.style.setProperty('--vxe-ui-tree-node-current-background-color', primaryTinge);
  body?.style.setProperty('--vxe-ui-tree-node-current-background-color', primaryTinge);

  // 树节点当前行 hover 背景色
  const treeHoverCurrentBg = base.tint(80).toHexString();
  root.style.setProperty('--vxe-ui-tree-node-hover-current-background-color', treeHoverCurrentBg);
  body?.style.setProperty('--vxe-ui-tree-node-hover-current-background-color', treeHoverCurrentBg);

  // 树节点 checkbox 选中背景色
  root.style.setProperty('--vxe-ui-tree-node-checkbox-checked-background-color', primaryTinge);
  body?.style.setProperty('--vxe-ui-tree-node-checkbox-checked-background-color', primaryTinge);

  // 树节点 checkbox 选中 hover 背景色
  root.style.setProperty('--vxe-ui-tree-node-hover-checkbox-checked-background-color', treeHoverCurrentBg);
  body?.style.setProperty('--vxe-ui-tree-node-hover-checkbox-checked-background-color', treeHoverCurrentBg);

  // 树节点 radio 选中背景色
  root.style.setProperty('--vxe-ui-tree-node-radio-checked-background-color', primaryTinge);
  body?.style.setProperty('--vxe-ui-tree-node-radio-checked-background-color', primaryTinge);

  // 树节点 radio 选中 hover 背景色
  root.style.setProperty('--vxe-ui-tree-node-hover-radio-checked-background-color', treeHoverCurrentBg);
  body?.style.setProperty('--vxe-ui-tree-node-hover-radio-checked-background-color', treeHoverCurrentBg);

  // ==================== 表格相关 ====================
  // 表格行 hover 背景色
  const rowHoverBg = base.tint(95).toHexString();
  root.style.setProperty('--vxe-ui-table-row-hover-background-color', rowHoverBg);
  body?.style.setProperty('--vxe-ui-table-row-hover-background-color', rowHoverBg);

  // 表格行 striped hover 背景色
  root.style.setProperty('--vxe-ui-table-row-hover-striped-background-color', rowHoverBg);
  body?.style.setProperty('--vxe-ui-table-row-hover-striped-background-color', rowHoverBg);

  // 表格当前行背景色
  root.style.setProperty('--vxe-ui-table-row-current-background-color', primaryTinge);
  body?.style.setProperty('--vxe-ui-table-row-current-background-color', primaryTinge);

  // 表格当前行 hover 背景色
  root.style.setProperty('--vxe-ui-table-row-hover-current-background-color', treeHoverCurrentBg);
  body?.style.setProperty('--vxe-ui-table-row-hover-current-background-color', treeHoverCurrentBg);

  // 表格列 hover 背景色
  root.style.setProperty('--vxe-ui-table-column-hover-background-color', treeHoverCurrentBg);
  body?.style.setProperty('--vxe-ui-table-column-hover-background-color', treeHoverCurrentBg);

  // 表格列当前行背景色
  root.style.setProperty('--vxe-ui-table-column-current-background-color', primaryTinge);
  body?.style.setProperty('--vxe-ui-table-column-current-background-color', primaryTinge);

  // 表格列当前行 hover 背景色
  root.style.setProperty('--vxe-ui-table-column-hover-current-background-color', treeHoverCurrentBg);
  body?.style.setProperty('--vxe-ui-table-column-hover-current-background-color', treeHoverCurrentBg);

  // Checkbox 选中行背景色
  root.style.setProperty('--vxe-ui-table-row-checkbox-checked-background-color', primaryTinge);
  body?.style.setProperty('--vxe-ui-table-row-checkbox-checked-background-color', primaryTinge);

  // Checkbox 选中行 hover 背景色
  root.style.setProperty('--vxe-ui-table-row-hover-checkbox-checked-background-color', treeHoverCurrentBg);
  body?.style.setProperty('--vxe-ui-table-row-hover-checkbox-checked-background-color', treeHoverCurrentBg);

  // Radio 选中行背景色
  root.style.setProperty('--vxe-ui-table-row-radio-checked-background-color', primaryTinge);
  body?.style.setProperty('--vxe-ui-table-row-radio-checked-background-color', primaryTinge);

  // Radio 选中行 hover 背景色
  root.style.setProperty('--vxe-ui-table-row-hover-radio-checked-background-color', treeHoverCurrentBg);
  body?.style.setProperty('--vxe-ui-table-row-hover-radio-checked-background-color', treeHoverCurrentBg);

  // 可拖拽线颜色
  root.style.setProperty('--vxe-ui-table-resizable-drag-line-color', primaryColor);
  body?.style.setProperty('--vxe-ui-table-resizable-drag-line-color', primaryColor);

  // 选中区域边框色
  root.style.setProperty('--vxe-ui-table-cell-area-border-color', primaryColor);
  body?.style.setProperty('--vxe-ui-table-cell-area-border-color', primaryColor);
}

export { generatePrimaryColors, applyPrimaryColor, isValidColor };

