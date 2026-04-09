/**
 * 业务数据字典查询参数
 */
export interface YwsjzdQueryParams {
  pageNo: number;
  pageSize: number;
  authDict: {
    cSign?: string;   // 是否禁用
    cXuhao?: string;  // 字典编号
    cName?: string;   // 字典名称
    nParent: number;  // 父级ID，写死为0
  };
}

/**
 * 业务数据字典VO
 */
export interface YwsjzdVO {
  authDict: {
    id: number;
    cXuhao: string;      // 字典编号
    cName: string;       // 字典名称
    nParent: number;
    cCreate: string;
    dCreate: string;     // 创建日期
    nType: number;
    cSign: string;       // 是否启用
    cCreateName: string | null; // 创建人
    cMeta: string;
    nOrder: number | null;      // 排序
    cConnkey: string;
    cParentXuhao: string | null;
    cLang: string | null;
    cDataValue: string | null;
    cMemo: string | null;
  };
  childList: {
    id: number;
    cXuhao: string;
    cName: string;
    nParent: number;
    cCreate: string;
    dCreate: string;
    nType: number;
    cSign: string;
    cCreateName: string | null;
    cMeta: string;
    nOrder: number | null;
    cConnkey: string;
    cParentXuhao: string | null;
    cLang: string | null;
    cDataValue: string | null;
    cMemo: string | null;
  }[];
}

/**
 * 额外属性项
 */
export interface MetaItem {
  key: string;    // 属性键
  value: string;  // 属性值
}

/**
 * 业务数据字典表单VO
 */
export interface YwsjzdFormVO {
  cXuhao: string;      // 字典编号
  cName: string;       // 字典名称
  cSign: string;       // 是否启用
  nOrder?: number;     // 排序
  metaItems?: MetaItem[];  // 额外属性列表
}
