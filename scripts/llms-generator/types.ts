/**
 * LLM 文档生成器内部类型定义
 */

/** 组件属性信息 */
export interface PropInfo {
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
  required: boolean;
  deprecated?: boolean;
}

/** 组件事件信息 */
export interface EventInfo {
  name: string;
  parameters: string;
  description: string;
}

/** 组件暴露方法信息 */
export interface ExposeMethodInfo {
  name: string;
  signature: string;
  description: string;
}

/** 插槽信息 */
export interface SlotInfo {
  name: string;
  description: string;
  props?: string;
}

/** Hook 函数信息 */
export interface HookInfo {
  name: string;
  filePath: string;
  signature: string;
  description: string;
}

/** 组件信息 */
export interface ComponentInfo {
  /** 组件名 (如 SunnyForm) */
  name: string;
  /** 分类 (basic/data/entry/feedback/navigation/layout/composite) */
  category: string;
  /** 目录相对路径 (如 entry/form) */
  directory: string;
  /** types.ts 文件路径 */
  typesPath: string | null;
  /** Vue/TSX 组件文件路径列表 */
  componentPaths: string[];
  /** index.ts 文件路径 */
  indexPath: string | null;
  /** Hook 文件路径列表 */
  hookPaths: string[];
  /** 描述 (从 Props 接口 JSDoc 或组件注释中提取) */
  description: string;
  /** 解析后的 Props */
  props: PropInfo[];
  /** 解析后的事件 */
  events: EventInfo[];
  /** 解析后的暴露方法 */
  exposeMethods: ExposeMethodInfo[];
  /** 解析后的插槽 */
  slots: SlotInfo[];
  /** 解析后的 Hook */
  hooks: HookInfo[];
  /** 导入名称 (用于 import 示例) */
  exportNames: string[];
}

/** 分类信息 */
export interface CategoryInfo {
  key: string;
  label: string;
  components: ComponentInfo[];
}

/** 生成器配置 */
export interface GeneratorConfig {
  /** UI 包源码目录 */
  uiSrcDir: string;
  /** 输出目录 */
  outputDir: string;
  /** 文档站点基础 URL */
  docsBaseUrl: string;
  /** 分类列表 */
  categories: { key: string; label: string }[];
}
