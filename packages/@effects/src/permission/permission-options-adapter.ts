import { requestClient } from '../api/request';
import type { SelectOption, SelectFieldMapping } from '@sunny-base-web/ui';

/**
 * 转换原始数据为标准格式
 * Transform raw data to standard format
 * @param data - 原始数据数组
 * @param fieldMapping - 字段映射配置
 * @returns 标准格式的选项数组
 */
function transformOptions(
  data: any[],
  fieldMapping?: SelectFieldMapping
): SelectOption[] {
  if (!Array.isArray(data)) return [];

  const { label = 'cName', value = 'cXuhao' } = fieldMapping || {};

  return data.map((item) => ({
    label: String(item[label] || ''),
    value: item[value],
    ...item, // 保留原始字段
  }));
}

/**
 * 权限选项适配器
 * Permission options adapter
 * @description 调用 /core/contact/findUserExresList 接口批量加载权限选项
 * @description Calls /core/contact/findUserExresList API to batch load permission options
 */
export const permissionOptionsAdapter = {
  /**
   * 批量加载权限选项
   * Batch load permission options
   * @param numbList - 权限编码列表
   * @param fieldMapping - 字段映射配置
   * @returns 选项映射表 { code: options }
   */
  loadOptions: async (
    numbList: (string | number)[],
    fieldMapping?: SelectFieldMapping
  ): Promise<Record<string, SelectOption[]>> => {
    if (!numbList || numbList.length === 0) {
      return {};
    }

    try {
      const response = await requestClient.post<{
        [key: string]: any[];
      }>('/core/contact/findUserExresList', {
        numbList,
      });

      const result = response?.result || response;
      const optionsMap: Record<string, SelectOption[]> = {};

      // 转换每个权限编码的选项
      // Transform each permission code's options
      Object.keys(result).forEach((code: string) => {
        optionsMap[code] = transformOptions(result[code] as any[], fieldMapping);
      });

      return optionsMap;
    } catch (error) {
      console.error('[PermissionOptionsAdapter] Failed to load options:', error);
      return {};
    }
  },
};
