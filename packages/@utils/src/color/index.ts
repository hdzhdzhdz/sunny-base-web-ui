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
 * 应用主题色到页面
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

  // 打印调试信息
  console.log('已应用主题色:', primaryColor, colors);
}

export { generatePrimaryColors, applyPrimaryColor, isValidColor };

