/**
 * @file form/index.ts
 * @description 表单业务配置
 *
 * 提供表单相关的业务配置，包括 BusinessSearch API 适配器等
 * 应用层可以通过 setupBusinessForm 覆盖默认配置
 */

import {
  setupSunnyForm,
  type FormCommonConfig,
  type BusinessSearchAdapter,
  type BusinessSearchConfig,
  type BusinessSearchParams,
  type BusinessSearchResult,
  type FormSchema,
  type CustomizeSelectAdapter,
  type CustomizeSelectQueryParams,
  type CustomizeSelectQueryResult,
  type VxeGridPropTypes,
} from '@sunny-base-web/ui';
import { requestClient } from '../api/request';
import { defaultSelectOptionsAdapter } from './select-options-adapter';
import { defaultPermissionOptionsAdapter } from './permission-options-adapter';

// =============================================================================
// 类型定义
// =============================================================================

/**
 * 后端返回的动态配置格式
 * Backend dynamic configuration format
 */
interface DynamicConfigResponse {
  /**
   * 弹窗标题
   */
  cTitle: string;
  /**
   * 弹窗宽度
   */
  cWidth?: string | number;
  /**
   * 弹窗高度
   */
  cHeight?: string | number;
  /**
   * 选择模式 (single/multiple)
   */
  cSelectionMode?: 'single' | 'multiple';
  /**
   * 查询条件配置
   */
  conditions: Array<{
    label: string;
    type: string;
    prop: string;
    meta?: any;
    [key: string]: any;
  }>;
  /**
   * 表格列配置
   */
  tableCols: Array<{
    label: string;
    prop: string;
    width?: number | string;
    [key: string]: any;
  }>;
}

/**
 * setupBusinessForm 选项类型
 */
export interface SetupBusinessFormOptions {
  /**
   * 自定义配置（会与默认配置合并，自定义配置优先）
   */
  config?: Partial<FormCommonConfig>;
  /**
   * 自定义验证规则
   */
  defineRules?: Record<string, any>;
}

// =============================================================================
// 格式转换工具函数
// =============================================================================

/**
 * 映射组件类型
 * Map component type
 * @param type 后端返回的组件类型
 */
function mapComponentType(type: string): string {
  const map: Record<string, string> = {
    input: 'Input',
    select: 'Select',
    date: 'DatePicker',
    datetime: 'TimePicker',
  };
  return map[type] || 'Input';
}

/**
 * 映射表单配置
 * Map form schema
 * @param conditions 后端返回的查询条件
 */
function mapFormSchema(conditions: DynamicConfigResponse['conditions']): FormSchema[] {
  return conditions.map((item) => ({
    label: item.label,
    fieldName: item.prop,
    component: mapComponentType(item.type) as any,
    componentProps: {
      placeholder: item.meta?.placeholder || `请输入${item.label}`,
      ...item.meta,
    },
  }));
}

/**
 * 映射表格列配置
 * Map table columns
 * @param tableCols 后端返回的表格列
 */
function mapTableColumns(tableCols: DynamicConfigResponse['tableCols']): VxeGridPropTypes.Columns {
  return tableCols.map((item) => ({
    title: item.label,
    field: item.prop,
    width: item.width,
  }));
}

/**
 * 将后端动态配置映射为组件需要的配置格式
 * Map backend dynamic config to component config format
 * @param res 后端返回的动态配置
 */
function mapDynamicConfig(res: DynamicConfigResponse): BusinessSearchConfig {
  return {
    title: res.cTitle,
    width: res.cWidth
      ? isNaN(Number(res.cWidth))
        ? res.cWidth
        : `${res.cWidth}px`
      : undefined,
    contentHeight: res.cHeight
      ? isNaN(Number(res.cHeight))
        ? res.cHeight
        : Number(res.cHeight)
      : 300,
    multiple: res.cSelectionMode !== 'single',
    formSchema: mapFormSchema(res.conditions),
    tableColumns: mapTableColumns(res.tableCols),
  };
}

/**
 * 映射查询参数
 * Map search params
 * @param params 组件传出的查询参数
 * @param cNum 动态配置编码
 */
function mapSearchParams(params: BusinessSearchParams, cNum: string): any {
  // SearchModal 传递的是 pageNo/pageSize，需要排除这些分页参数
  const { page, pageNo, pageSize, ...conditions } = params;
  return {
    pageNo: pageNo || page,
    pageSize,
    sqlNum: cNum,
    conditions,
  };
}

/**
 * 映射查询结果
 * Map search result
 * @param res 后端返回的结果
 */
function mapSearchResult(res: any): BusinessSearchResult {
  const result = res?.result || res;
  return {
    records: result?.records || result?.list || [],
    total: result?.total || result?.totalSize || 0,
  };
}

// =============================================================================
// 默认 BusinessSearch API 适配器实现
// =============================================================================

/**
 * 默认的 BusinessSearch API 适配器
 * Default BusinessSearch API adapter
 *
 * 职责：
 * 1. 调用后端接口获取数据
 * 2. 将后端格式转换成组件需要的格式
 *
 * 适配的后端接口：
 * - 加载配置: POST /core/assDialog/openInit
 * - 搜索数据: POST /core/assDialog/selectForPageCommon
 */
export const defaultBusinessSearchAdapter: BusinessSearchAdapter = {
  /**
   * 加载动态配置
   * 1. 调用 /core/assDialog/openInit 获取后端配置
   * 2. 转换成组件需要的 BusinessSearchConfig 格式
   *
   * @param cNum 配置编码
   * @returns 组件配置
   */
  loadConfig: async (cNum: string): Promise<BusinessSearchConfig> => {
    const res = await requestClient.post<DynamicConfigResponse>(
      '/core/assDialog/openInit',
      { cNum },
    );

    return mapDynamicConfig(res);
  },

  /**
   * 搜索数据
   * 1. 接收组件传入的参数
   * 2. 转换成后端需要的格式
   * 3. 调用 /core/assDialog/selectForPageCommon
   * 4. 转换返回结果
   *
   * @param params 搜索参数
   * @returns 搜索结果
   */
  search: async (params: BusinessSearchParams): Promise<BusinessSearchResult> => {
    const { cNum, ...searchParams } = params;

    const payload = mapSearchParams(searchParams, cNum);

    const res = await requestClient.post(
      '/core/assDialog/selectForPageCommon',
      payload,
    );

    return mapSearchResult(res);
  },
};

const defaultCustomizeSelectAdapter: CustomizeSelectAdapter = {
  query: async (params: CustomizeSelectQueryParams): Promise<CustomizeSelectQueryResult> => {
    const res = await requestClient.post('/core/assSelect/commonQuery', params as any);
    const result = (res as any)?.result || {};
    return {
      options: result.optionList || [],
      config: result.assSelect || undefined,
    };
  },
};

// =============================================================================
// 默认表单配置
// =============================================================================

/**
 * 默认表单配置
 */
const defaultFormConfig: FormCommonConfig = {
  disabled: false,                    // ✅ 新增：默认不禁用
  disabledOnChangeListener: true,     // 默认禁用 change 事件监听
  disabledOnInputListener: true,      // 默认禁用 input 事件监听
  emptyStateValue: undefined,         // 空状态值
  businessSearchAdapter: defaultBusinessSearchAdapter,
  customizeSelectAdapter: defaultCustomizeSelectAdapter,
  selectOptionsAdapter: defaultSelectOptionsAdapter,  // ✅ 已有：字典选项适配器
  permissionOptionsAdapter: defaultPermissionOptionsAdapter,  // ✅ 新增：权限选项适配器
  apiPrefix: undefined,
};

// =============================================================================
// 导出函数
// =============================================================================

/**
 * 初始化业务表单配置
 *
 * @description
 * 在应用入口调用此函数，初始化表单相关的业务配置。
 * 传入的配置会与默认配置合并，自定义配置优先。
 *
 * @example
 * ```typescript
 * // apps/web/src/bootstrap.ts
 * import { setupBusinessForm } from '@sunny-base-web/effects';
 *
 * // 方式1：使用默认配置（适用于标准业务系统）
 * setupBusinessForm();
 *
 * // 方式2：覆盖部分配置
 * setupBusinessForm({
 *   config: {
 *     businessSearchAdapter: {
 *       // 只覆盖 loadConfig，search 仍使用默认实现
 *       loadConfig: async (cNum) => {
 *         return myCustomApi.loadConfig(cNum);
 *       },
 *     },
 *   },
 * });
 *
 * // 方式3：完全自定义（适用于非标准业务系统）
 * setupBusinessForm({
 *   config: {
 *     businessSearchAdapter: {
 *       loadConfig: async (cNum) => {
 *         const res = await myApi.getConfig(cNum);
 *         // 完全自定义转换逻辑
 *         return {
 *           title: res.title,
 *           formSchema: res.fields,
 *           tableColumns: res.columns,
 *         };
 *       },
 *       search: async (params) => {
 *         const res = await myApi.search(params);
 *         return {
 *           records: res.data,
 *           total: res.count,
 *         };
 *       },
 *     },
 *   },
 *   defineRules: {
 *     phone: (value) => /^1[3-9]\d{9}$/.test(value) || '请输入正确的手机号',
 *   },
 * });
 * ```
 */
export function setupBusinessForm(options: SetupBusinessFormOptions = {}) {
  const { config: customConfig, defineRules } = options;

  // 深度合并配置（自定义配置优先）
  const mergedConfig: FormCommonConfig = {
    ...defaultFormConfig,
    ...customConfig,
    // 特殊处理 businessSearchAdapter，支持部分覆盖
    businessSearchAdapter: {
      ...defaultFormConfig.businessSearchAdapter,
      ...customConfig?.businessSearchAdapter,
    },
    customizeSelectAdapter: {
      ...defaultFormConfig.customizeSelectAdapter,
      ...(customConfig as any)?.customizeSelectAdapter,
    },
    // 特殊处理 selectOptionsAdapter，支持部分覆盖
    selectOptionsAdapter: {
      ...defaultFormConfig.selectOptionsAdapter,
      ...(customConfig as any)?.selectOptionsAdapter,
    },
    apiPrefix: customConfig?.apiPrefix,
  };

  setupSunnyForm({
    config: mergedConfig,
    defineRules,
  });
}

// 导出默认配置，供需要完全自定义的场景使用
export { defaultFormConfig };

// 导出 Select 选项相关功能
export { useSelectOptions } from './use-select-options';
export { selectOptionsManager } from './select-options-manager';
export { defaultSelectOptionsAdapter } from './select-options-adapter';
export type {
  UseSelectOptionsParams,
  UseSelectOptionsReturn,
} from './use-select-options';

// 导出 Permission 选项相关功能
export { usePermissionOptions } from './use-permission-options';
export { permissionOptionsManager } from './permission-options-manager';
export { defaultPermissionOptionsAdapter } from './permission-options-adapter';
export type {
  UsePermissionOptionsParams,
  UsePermissionOptionsReturn,
} from './use-permission-options';
