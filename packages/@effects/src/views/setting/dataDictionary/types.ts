/**
 * 数据字典查询参数
 */
export interface DataDictionaryQueryParams {
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
 * 数据字典VO
 */
export interface DataDictionaryVO {
  id: string;          // 数据字典id
  cXuhao: string;      // 字典编号
  cName: string;       // 字典名称
  cSign: string;       // 是否启用
  dCreate: string;     // 创建日期
  cCreateName: string; // 创建人
  nOrder: number;      // 排序
}

/**
 * 额外属性项
 */
export interface MetaItem {
  key: string;    // 属性键
  value: string;  // 属性值
}

/**
 * 数据字典表单VO
 */
export interface DataDictionaryFormVO {
  cXuhao: string;      // 字典编号
  cName: string;       // 字典名称
  cSign: string;       // 是否启用
  nOrder?: number;     // 排序
  metaItems?: MetaItem[];  // 额外属性列表
}
