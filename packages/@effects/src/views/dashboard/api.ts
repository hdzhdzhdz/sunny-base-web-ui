import { requestClient } from '@sunny-base-web/effects';

/**
 * 快捷入口项
 */
export interface QuickEntryItem {
  /** 图标 */
  cIcon: string;
  /** 模块描述 */
  cModdesc: string | null;
  /** 模块名称 */
  cModname: string;
  /** 排序 */
  cOrder: number | null;
  /** 路由路径 */
  cUrl: string;
  /** 视图路径 */
  cViewpath: string;
}

/**
 * 查询快捷入口请求参数
 */
export interface QuickEntryQueryParams {
  /** 创建用户 */
  cCreateuser: string;
}

/**
 * 模块子项
 */
export interface ModListItem {
  /** 显示名称 */
  cShowname: string;
  /** 是否选中 '1' 表示选中 */
  check: string;
  /** 资源ID */
  nResourceid: number;
  /** 排序 */
  nOrder: number;
  /** 路由路径 */
  cUrl?: string;
  /** 图标 */
  cIcon?: string;
  /** 模块描述 */
  cModdesc?: string;
}

/**
 * 可选模块分组
 */
export interface ModGroup {
  /** 分组名称 */
  cShowname: string;
  /** 模块列表 */
  modList: ModListItem[];
}

/**
 * 可选模块查询参数
 */
export interface SelModQueryParams {
  /** 创建用户 */
  cCreateuser: string;
}

/**
 * 可选模块响应
 */
export interface SelModResponse {
  result: ModGroup[];
}

/**
 * 查询快捷入口
 */
export function queryQuickEntry(params: QuickEntryQueryParams) {
  return requestClient.post<{ result: QuickEntryItem[] }>('/core/assQuickentry/query', params);
}

/**
 * 查询可选模块列表
 */
export function querySelMod(params: SelModQueryParams) {
  return requestClient.post<SelModResponse>('/core/assQuickentry/sel_mod', params);
}

/**
 * 插入快捷入口请求参数
 */
export interface InsertQuickEntryParams {
  /** 快捷入口主信息 */
  assQuickentry: {
    /** 创建用户 */
    cCreateuser: string;
  };
  /** 快捷入口列表 */
  assQuickentryList: Array<{
    /** 资源ID */
    nResourceid: number;
    /** 排序 */
    nOrder: number;
  }>;
}

/**
 * 插入快捷入口
 */
export function insertQuickEntry(params: InsertQuickEntryParams) {
  return requestClient.post('/core/assQuickentry/insert_sel_mod', params);
}
