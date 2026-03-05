import { requestClient } from '../request';

/**
 * 查询数据字典
 */
export function queryByXuhao(data: any) {
  return requestClient.post('/core/authDict/queryByXuhao', data);
}

/**
 * 查找资源树
 */
export function findMenuAll(data: any) {
  return requestClient.post('/core/authResource/findMenuAll', data);
}

/**
 * 获取资源内容
 */
export function queryResource(data: any) {
  return requestClient.post('/core/authResource/queryResource', data);
}

/**
 * 获取区域资源（新增）
 */
export function queryAreaResource(data: any) {
  return requestClient.post('/core/authResource/queryAreaResource', data);
}

/**
 * 保存资源
 */
export function saveMenu(data: any) {
  return requestClient.post('/core/authResource/saveMenu', data);
}

/**
 * 获取绑定的url
 */
export function queryMenuUrl(data: any) {
  return requestClient.post('/core/authResource/queryMenuUrl', data);
}

/**
 * 保存URL绑定
 */
export function saveBatchMenuUrl(data: any) {
  return requestClient.post('/core/authResource/saveBatchMenuUrl', data);
}

/**
 * 获取单个资源的内容
 */
export function getMenu(data: any) {
  return requestClient.post('/core/authResource/getMenu', data);
}

/**
 * 删除资源
 */
export function delMenu(data: any) {
  return requestClient.post('/core/authResource/delMenu', data);
}

/**
 * 按钮(批量)保存
 */
export function saveButton(data: any) {
  return requestClient.post('/core/authResource/saveButton', data);
}

/**
 * 字段(批量)保存
 */
export function saveField(data: any) {
  return requestClient.post('/core/authResource/saveField', data);
}

/**
 * 菜单路径变更(查询全菜单路径)
 */
export function queryCascader(data: any) {
  return requestClient.post('/core/authResource/queryCascader', data);
}

/**
 * 菜单路径变更(保存)
 */
export function saveMenuMove(data: any) {
  return requestClient.post('/core/authResource/saveMenuMove', data);
}

/**
 * 资源树同层级移动顺序
 */
export function moveMenuOrder(data: any) {
  return requestClient.post('/core/authResource/moveMenuOrder', data);
}

/**
 * 分页查询后台表字段
 */
export function selectForPageTableColumns(data: any) {
  return requestClient.post('/core/authResource/selectForPageTableColumns', data);
}

/**
 * 远程搜索表名
 */
export function findTableName(data: any) {
  return requestClient.post('/core/authResource/findTableName', data);
}

/**
 * 根据表名获取字段
 */
export function findTableColumns(data: any) {
  return requestClient.post('/core/authResource/findTableColumns', data);
}

/**
 * 树搜索
 */
export function findMenuTreeFuzzy(data: any) {
  return requestClient.post('/core/authResource/findMenuTreeFuzzy', data);
}


/**
 * 根据父级资源ID获取子集资源
 */
export function getCurrentUserResourcesByParId(data: any) {
  return requestClient.post('/core/contact/getCurrentUserResourcesByParId', data);
}