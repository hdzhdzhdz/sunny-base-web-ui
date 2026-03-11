import { requestClient } from './request';

/**
 * 查找所有菜单
 * @param params 参数
 */
export async function findMenuAll(params: any) {
  return requestClient.post('/core/authResource/findMenuAll', params);
}

/**
 * 获取区域资源（新增）
 * @param params 参数
 */
export async function queryAreaResource(params: any) {
  return requestClient.post('/core/authResource/queryAreaResource', params);
}

/**
 * 查询资源
 * @param params 参数
 */
export async function queryResource(params: any) {
  return requestClient.post('/core/authResource/queryResource', params);
}

/**
 * 查询数据字典
 * @param params 参数
 */
export async function queryByXuhao(params: any) {
  return requestClient.post('/core/authDict/queryByXuhao', params);
}

/**
 * 树搜索
 * @param params 参数
 */
export async function findMenuTreeFuzzy(params: any) {
  return requestClient.post('/core/authResource/findMenuTreeFuzzy', params);
}

/**
 * 获取菜单详情
 * @param params 参数
 */
export async function getMenu(params: any) {
  return requestClient.post('/core/authResource/getMenu', params);
}

/**
 * 删除菜单
 * @param params 参数
 */
export async function delMenu(params: any) {
  return requestClient.post('/core/authResource/delMenu', params);
}

/**
 * 移动菜单顺序
 * @param params 参数
 */
export async function moveMenuOrder(params: any) {
  return requestClient.post('/core/authResource/moveMenuOrder', params);
}



/**
 * 查询级联选择器数据
 * @param params 参数
 */
export async function queryCascader(params: any) {
  return requestClient.post('/core/authResource/queryCascader', params);
}

/**
 * 保存菜单移动
 * @param params 参数
 */
export async function saveMenuMove(params: any) {
  return requestClient.post('/core/authResource/saveMenuMove', params);
}

/**
 * 保存资源
 * @param params 参数
 */
export async function saveMenu(params: any) {
  return requestClient.post('/core/authResource/saveMenu', params);
}

/**
 * 获取绑定的url
 * @param params 参数
 */
export async function queryMenuUrl(params: any) {
  return requestClient.post('/core/authResource/queryMenuUrl', params);
}

/**
 * 保存URL绑定
 * @param params 参数
 */
export async function saveBatchMenuUrl(params: any) {
  return requestClient.post('/core/authResource/saveBatchMenuUrl', params);
}

/**
 * 远程搜索表名
 * @param params 参数
 */
export async function findTableName(params: any) {
  return requestClient.post('/core/authResource/findTableName', params);
}

/**
 * 根据表名获取字段
 * @param params 参数
 */
export async function findTableColumns(params: any) {
  return requestClient.post('/core/authResource/findTableColumns', params);
}

/**
 * 按钮(批量)保存
 * @param params 参数
 */
export async function saveButton(params: any) {
  return requestClient.post('/core/authResource/saveButton', params);
}

/**
 * 字段(批量)保存
 * @param params 参数
 */
export async function saveField(params: any) {
  return requestClient.post('/core/authResource/saveField', params);
}

/**
 * 分页查询后台表字段
 * @param params 参数
 */
export async function selectForPageTableColumns(params: any) {
  return requestClient.post('/core/authResource/selectForPageTableColumns', params);
}

/**
 * 根据模块编号获取资源
 * @param params 参数
 * @param config 配置
 */
export async function getResourceByParIdOrModnumb(params: {
  modnumb: string;
  types?: number[];
}, config?: any) {
  return requestClient.post('/core/contact/getCurrentUserResourcesByParId', {
    ...params,
    types: params.types || [2, 3]
  }, config);
}

/**
 * 根据父级资源ID获取子集资源
 * @param params 参数
 */
export async function getCurrentUserResourcesByParId(params: any) {
  return requestClient.post('/core/contact/getCurrentUserResourcesByParId', params);
}

/**
 * 初始化资源构造器
 * @param resources 资源数据
 */
export function initResourceConstructor(resources: any) {
  const resFieldList: Record<string, any[]> = {};
  const resButtonList: Record<string, any[]> = {};
  const resColumnList: Record<string, any[]> = {};

  // 检查是否是直接返回的resButtonList数组
  if (resources && resources.resButtonList && Array.isArray(resources.resButtonList)) {
    // 处理直接返回的按钮数组
    resources.resButtonList.forEach(button => {
      const { cName, cIcon, nOrder, cStoremethod } = button;
      
      // 从cStoremethod中提取code，如"dataDictionary/add" -> "add"
      const code = cStoremethod ? cStoremethod.split('/').pop() : '';
      
      // 使用cArea作为parentcode，默认为"table"
      const parentcode = button.cArea || 'table';
      
      if (!resButtonList[parentcode]) {
        resButtonList[parentcode] = [];
      }
      
      resButtonList[parentcode].push({
        code: code,
        name: cName,
        icon: cIcon,
        order: nOrder
      });
    });
  } else if (resources && Array.isArray(resources)) {
    // 处理传统的资源数组
    resources.forEach(resource => {
      const { cType, cCode, cName, cIcon, nOrder } = resource;
      
      if (cType === 'field') {
        if (!resFieldList[resource.cParentcode]) {
          resFieldList[resource.cParentcode] = [];
        }
        resFieldList[resource.cParentcode].push({
          code: cCode,
          name: cName,
          icon: cIcon,
          order: nOrder
        });
      } else if (cType === 'button') {
        if (!resButtonList[resource.cParentcode]) {
          resButtonList[resource.cParentcode] = [];
        }
        resButtonList[resource.cParentcode].push({
          code: cCode,
          name: cName,
          icon: cIcon,
          order: nOrder
        });
      } else if (cType === 'column') {
        if (!resColumnList[resource.cParentcode]) {
          resColumnList[resource.cParentcode] = [];
        }
        resColumnList[resource.cParentcode].push({
          code: cCode,
          name: cName,
          icon: cIcon,
          order: nOrder
        });
      }
    });
  }

  return { resFieldList, resButtonList, resColumnList };
}
