import * as fs from 'fs';
import * as path from 'path';
import type { ComponentInfo, GeneratorConfig } from './types';

const COMPONENT_CATEGORIES = ['basic', 'data', 'entry', 'feedback', 'navigation', 'layout', 'composite'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  basic: 'Basic Components / 基础组件',
  data: 'Data Display / 数据展示',
  entry: 'Data Entry / 数据录入',
  feedback: 'Feedback / 反馈',
  navigation: 'Navigation / 导航',
  layout: 'Layout / 布局',
  composite: 'Composite / 复合组件',
};

/**
 * 扫描组件目录，发现所有组件
 */
export function scanComponents(config: GeneratorConfig): ComponentInfo[] {
  const components: ComponentInfo[] = [];
  const uiSrc = config.uiSrcDir;

  // 从主 index.ts 构建公开导出名称集合
  const publicExports = buildPublicExports(path.join(uiSrc, 'index.ts'));

  for (const category of COMPONENT_CATEGORIES) {
    const categoryDir = path.join(uiSrc, category);
    if (!fs.existsSync(categoryDir)) continue;

    const entries = fs.readdirSync(categoryDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const componentDir = path.join(categoryDir, entry.name);
      const componentInfo = scanComponentDir(componentDir, category, entry.name, publicExports);
      if (componentInfo) {
        components.push(componentInfo);
      }
    }
  }

  return components;
}

/**
 * 从主 index.ts 构建公开导出名称集合
 */
function buildPublicExports(mainIndexPath: string): Set<string> {
  const names = new Set<string>();
  if (!fs.existsSync(mainIndexPath)) return names;

  const content = fs.readFileSync(mainIndexPath, 'utf-8');

  // export { Xxx, Yyy, ... }
  const exportBlockRegex = /export\s*\{([^}]+)\}/g;
  let match;
  while ((match = exportBlockRegex.exec(content)) !== null) {
    for (const item of match[1].split(',')) {
      const trimmed = item.trim();
      // 处理 "Xxx as Yyy" — 取 as 后面的名字
      const asMatch = trimmed.match(/\w+\s+as\s+(\w+)/);
      const name = asMatch ? asMatch[1] : trimmed;
      if (name) names.add(name);
    }
  }

  // export * from './xxx/types'
  const starExportRegex = /export\s*\*\s*from\s*['"]\.\/([^'"]+)['"]/g;
  while ((match = starExportRegex.exec(content)) !== null) {
    names.add(`*:${match[1]}`);
  }

  // export function / const
  const funcRegex = /export\s+(?:function|const)\s+(\w+)/g;
  while ((match = funcRegex.exec(content)) !== null) {
    names.add(match[1]);
  }

  return names;
}

/**
 * 扫描单个组件目录
 */
function scanComponentDir(dir: string, category: string, dirName: string, publicExports: Set<string>): ComponentInfo | null {
  const files = fs.readdirSync(dir);

  const typesPath = files.includes('types.ts') ? path.join(dir, 'types.ts') : null;
  const indexPath = files.includes('index.ts') ? path.join(dir, 'index.ts') : null;

  const componentPaths = files.filter(
    (f) => f.endsWith('.vue') || f.endsWith('.tsx'),
  ).map((f) => path.join(dir, f));

  const hookPaths = files.filter(
    (f) => f.startsWith('use-') && f.endsWith('.ts'),
  ).map((f) => path.join(dir, f));

  // 至少需要有一个组件文件或 types.ts
  if (componentPaths.length === 0 && !typesPath) {
    return null;
  }

  // 推断组件名
  const name = inferComponentName(dir, files, indexPath);

  // 提取导出名，筛选出主 index.ts 中公开导出的
  const rawExportNames = extractExportNames(indexPath);
  const filteredExports = rawExportNames.filter((name) => {
    if (name.startsWith('*')) return true;
    return publicExports.has(name);
  });
  const exportNames = filteredExports.length > 0
    ? filteredExports
    : rawExportNames.filter((n) => !n.startsWith('*'));

  // 获取描述
  const description = extractDescription(name, typesPath, componentPaths);

  return {
    name,
    category,
    directory: `${category}/${dirName}`,
    typesPath,
    componentPaths,
    indexPath,
    hookPaths,
    description,
    props: [],
    events: [],
    exposeMethods: [],
    slots: [],
    hooks: [],
    exportNames,
  };
}

/**
 * 推断组件名
 */
function inferComponentName(dir: string, files: string[], indexPath: string | null): string {
  // 优先从 index.ts 的导出名推断（最准确）
  if (indexPath) {
    const content = fs.readFileSync(indexPath, 'utf-8');
    // 匹配 export function useSunnyXxx 或 export const useSunnyXxx
    const funcMatch = content.match(/export\s+(?:function|const)\s+(useSunny\w+)/);
    if (funcMatch) return funcMatch[1];

    // 匹配 export { SunnyXxx }
    const exportMatch = content.match(/export\s*\{[^}]*?(Sunny\w+)/);
    if (exportMatch) return exportMatch[1];

    // 匹配 export default SunnyXxx
    const defaultMatch = content.match(/export\s+default\s+(Sunny\w+)/);
    if (defaultMatch) return defaultMatch[1];

    // 匹配 export function 非 Sunny 前缀的（如 useXxx）
    const anyFuncMatch = content.match(/export\s+(?:function|const)\s+(\w+)/);
    if (anyFuncMatch) return anyFuncMatch[1];

    // 匹配 export * from './xxx' — 跟踪 re-export 找实际函数名
    const reExportMatches = [...content.matchAll(/export\s*\*\s*from\s*['"]\.\/([^'"]+)['"]/g)];
    for (const reExport of reExportMatches) {
      const targetFile = path.join(dir, reExport[1]);
      // 尝试 .ts 和 .tsx 扩展名
      for (const ext of ['.ts', '.tsx']) {
        const targetPath = targetFile.endsWith(ext) ? targetFile : targetFile + ext;
        if (fs.existsSync(targetPath)) {
          const targetContent = fs.readFileSync(targetPath, 'utf-8');
          const funcInTarget = targetContent.match(/export\s+(?:function|const)\s+(useSunny\w+|\w+)/);
          if (funcInTarget) return funcInTarget[1];
        }
      }
    }
  }

  // 从 Sunny*.vue 或 Sunny*.tsx 文件名获取
  const sunnyFile = files.find(
    (f) => f.startsWith('Sunny') && (f.endsWith('.vue') || f.endsWith('.tsx')),
  );
  if (sunnyFile) {
    return path.basename(sunnyFile, path.extname(sunnyFile));
  }

  // 从其他 Vue/TSX 文件名获取（如 Modal.vue -> SunnyModal, icon.vue -> SunnyIcon）
  const componentFile = files.find(
    (f) => f.endsWith('.vue') || f.endsWith('.tsx'),
  );
  if (componentFile) {
    const baseName = path.basename(componentFile, path.extname(componentFile));
    // PascalCase 文件名如 Modal.vue, ErrorBoundary.vue, Select.tsx
    if (baseName[0] === baseName[0].toUpperCase() && baseName !== 'index') {
      return baseName.startsWith('Sunny') ? baseName : `Sunny${baseName}`;
    }
    // 小写文件名如 icon.vue -> SunnyIcon
    if (baseName !== 'index') {
      return `Sunny${baseName.charAt(0).toUpperCase()}${baseName.slice(1)}`;
    }
  }

  // 从 index.vue 获取（如 data/upload/index.vue）
  if (files.includes('index.vue')) {
    const dirName = path.basename(dir);
    return `Sunny${dirName.charAt(0).toUpperCase()}${dirName.slice(1)}`;
  }

  // 兜底：从目录名推断
  const dirName = path.basename(dir);
  return `Sunny${dirName.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`;
}

/**
 * 从 index.ts 提取导出名
 */
function extractExportNames(indexPath: string | null): string[] {
  if (!indexPath) return [];
  const content = fs.readFileSync(indexPath, 'utf-8');
  const names: string[] = [];
  const seen = new Set<string>();

  function addName(name: string) {
    const trimmed = name.trim();
    if (trimmed && trimmed !== 'default' && !seen.has(trimmed)) {
      seen.add(trimmed);
      names.push(trimmed);
    }
  }

  // export { X as Y } / export { default as SunnyIcon }
  const exportBlockRegex = /export\s*\{([^}]+)\}/g;
  let match;
  while ((match = exportBlockRegex.exec(content)) !== null) {
    for (const item of match[1].split(',')) {
      const parts = item.trim().split(/\s+as\s+/);
      // 取 as 后面的名字（如果有的话），否则取原名
      const exportName = (parts.length > 1 ? parts.at(-1) : parts[0]) ?? parts[0];
      addName(exportName);
    }
  }

  // export function useXxx / export const useXxx
  const funcExportRegex = /export\s+(?:function|const)\s+(\w+)/g;
  while ((match = funcExportRegex.exec(content)) !== null) {
    addName(match[1]);
  }

  // export * from './types'
  const starExportRegex = /export\s*\*\s*from\s*['"]\.\/types['"]/;
  if (starExportRegex.test(content)) {
    names.push('*types');
  }

  return names;
}

/**
 * 提取组件描述 — 从组件 JSDoc 或目录名推断
 */
function extractDescription(
  componentName: string,
  typesPath: string | null,
  componentPaths: string[],
): string {
  // 从 types.ts 的 Props 接口 JSDoc 提取组件描述
  if (typesPath) {
    const content = require('fs').readFileSync(typesPath, 'utf-8');
    // 查找 Props 接口前的 JSDoc 描述
    const propsDescMatch = content.match(
      /\/\*\*\s*\n\s*\*\s*(.+?)\s*\n(\s*\*\s*.*?\n)*\s*\*\/\s*\nexport\s+interface\s+\w*Props/
    );
    if (propsDescMatch) {
      const raw = propsDescMatch[1]
        .replace(/\n\s*\*\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (raw && !isLowQualityDescription(raw, componentName)) return raw;
    }
  }

  // 从 Vue 文件的顶级注释获取
  for (const compPath of componentPaths) {
    const content = require('fs').readFileSync(compPath, 'utf-8');
    const scriptCommentMatch = content.match(
      /<!--\s*\n\s*(.+?)\s*\n\s*-->\s*\n\s*<script/
    );
    if (scriptCommentMatch) {
      const desc = scriptCommentMatch[1].trim();
      if (desc && !isLowQualityDescription(desc, componentName)) return desc;
    }
  }

  // 从组件名推断描述
  return componentNameToDesc(componentName);
}

/**
 * 判断是否为低质量描述
 */
function isLowQualityDescription(desc: string, componentName: string): boolean {
  const lower = desc.toLowerCase();
  // 纯组件名重复
  if (lower === componentName.toLowerCase()) return true;
  // 技术性注释
  const badPatterns = [
    /props?\s*(类型定义|定义)?\s*$/i,
    /组件\s*(属性|Props|定义)?\s*$/i,
    /^export/i,
    /^import/i,
    /^type\s/i,
  ];
  for (const pattern of badPatterns) {
    if (pattern.test(desc)) return true;
  }
  return false;
}

/**
 * 从组件名生成人类可读描述
 */
function componentNameToDesc(name: string): string {
  // 移除前缀
  const clean = name.replace(/^Sunny/, '').replace(/^useSunny/, '');
  // PascalCase to words
  const words = clean.replace(/([A-Z])/g, ' $1').trim();
  return words || name;
}

export { CATEGORY_LABELS };
