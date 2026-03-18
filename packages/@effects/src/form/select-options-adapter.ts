import { requestClient } from '../api/request';
import type { SelectOptionsAdapter, SelectOption, SelectFieldMapping } from '@sunny-base-web/ui';

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
    ...item, // 保留原始字段（id, cConnkey 等）
  }));
}

/**
 * 默认的 Select 选项适配器实现
 * Default Select options adapter implementation
 * @description 调用 /core/contact/findAuthDictList 接口批量加载字典选项
 * @description Calls /core/contact/findAuthDictList API to batch load dictionary options
 */
export const defaultSelectOptionsAdapter: SelectOptionsAdapter = {
  /**
   * 批量加载字典选项
   * Batch load dictionary options
   * @param numbList - 字典编码列表
   * @param fieldMapping - 字段映射配置
   * @returns 选项映射表 { dictCode: options }
   */
  loadOptions: async (numbList, fieldMapping) => {
    if (!numbList || numbList.length === 0) {
      return {};
    }

    try {
      const response = await requestClient.post<{
        [key: string]: any[];
      }>('/core/contact/findAuthDictList', {
        numbList,
      });

      const result = response?.result || response;
      const optionsMap: Record<string, SelectOption[]> = {};

      // 转换每个字典的选项
      // Transform each dictionary's options
      Object.keys(result).forEach((dictCode: string) => {
        optionsMap[dictCode] = transformOptions(result[dictCode] as any[], fieldMapping);
      });

      return optionsMap;
    } catch (error) {
      console.error('[SelectOptionsAdapter] Failed to load options:', error);
      return {};
    }
  },
};
