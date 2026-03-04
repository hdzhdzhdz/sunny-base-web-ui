import type { SelectOption } from '../select/types';

/**
 * API 配置对象
 */
export interface ApiSelectApiConfig {
  /** 接口请求函数 */
  api: (params: Record<string, any>) => Promise<any>;
  /** 参数映射 */
  paramsMapper?: (formValues: Record<string, any>, depValues: Record<string, any>) => Record<string, any>;
  /** 结果映射 */
  resultMapper?: (result: any) => SelectOption[];
}

/**
 * 基础 Props
 */
export interface ApiSelectProps {
  /** 绑定值 */
  modelValue?: any;
  /** 字段名 */
  fieldName?: string;
  /** 依赖字段（变化时触发请求） */
  deps: string[];
  /** API配置 */
  api: ((params: Record<string, any>) => Promise<any>) | ApiSelectApiConfig;
  /** 是否多选 */
  multiple?: boolean;
  /** 立即触发 */
  immediate?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 允许清空 */
  allowClear?: boolean;
  /** 禁用 */
  disabled?: boolean;
  /** 显示加载 */
  showLoading?: boolean;
  /** 空值时清空选项 */
  clearOptionsWhenEmpty?: boolean;
  /** 额外参数（每次请求都带上） */
  extraParams?: Record<string, any>;
  /** 透传属性 */
  [key: string]: any;

  /**
   * 是否支持搜索输入（用户输入时触发接口请求）
   * @default false
   */
  allowSearch?: boolean;

  /**
   * 搜索参数字段名
   * @default 'keyword'
   */
  searchField?: string;

  /**
   * 搜索防抖时间(ms)
   * @default 300
   */
  searchDebounce?: number;
}
