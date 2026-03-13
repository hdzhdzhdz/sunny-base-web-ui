/**
 * 测试查询页面 API
 */
import { requestClient } from '@sunny-base-web/effects';
import type { ResponseResult } from '@sunny-base-web/effects';
import type { TestQueryParams, TestVO } from '#/views/setting/demo/test/types';

// ----------------------------------------------------------------------
// API 函数
// ----------------------------------------------------------------------

/**
 * 分页查询测试数据
 */
export function selectForPage(params: TestQueryParams) {
  return requestClient.post<ResponseResult<{ records: TestVO[]; total: number }>>(
    '/test/selectForPage',
    params
  );
}

/**
 * 批量启用
 */
export function batchEnable(ids: number[]) {
  return requestClient.post<ResponseResult<void>>('/api/test/batchEnable', { ids });
}

/**
 * 批量禁用
 */
export function batchDisable(ids: number[]) {
  return requestClient.post<ResponseResult<void>>('/api/test/batchDisable', { ids });
}

/**
 * 批量删除
 */
export function batchDelete(ids: number[]) {
  return requestClient.post<ResponseResult<void>>('/api/test/batchDelete', { ids });
}

/**
 * 删除单条
 */
export function deleteOne(id: number) {
  return requestClient.post<ResponseResult<void>>('/api/test/delete', { id });
}

/**
 * 导出数据
 */
export function exportData(ids: number[]) {
  return requestClient.post<Blob>('/api/test/export', { ids }, {
    responseType: 'blob'
  });
}
