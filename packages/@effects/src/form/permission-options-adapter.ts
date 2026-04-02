import { requestClient } from '../api/request';
import type { SelectOption, PermissionFieldMapping } from '@sunny-base-web/ui';

/**
 * 权限选项适配器
 * Permission options adapter
 * @description 调用 /core/contact/findUserExresList 接口批量加载权限选项
 * @description Calls /core/contact/findUserExresList API to batch load permission options
 */
export const defaultPermissionOptionsAdapter = {
  /**
   * 批量加载权限选项
   * Batch load permission options
   * @param numbList - 权限编码列表
   * @param fieldMapping - 字段映射配置
   * @returns 选项映射表 { code: options }
   */
  loadOptions: async (
    numbList: (string | number)[],
    fieldMapping?: PermissionFieldMapping
  ): Promise<Record<string, SelectOption[]>> => {
    if (!numbList || numbList.length === 0) {
      return {};
    }

    const { label = 'cExresname', value = 'cExresnum' } = fieldMapping || {};

    // 获取 label 值
    const getLabel = (item: any): string => {
      if (typeof label === 'function') {
        return label(item);
      }
      if (Array.isArray(label)) {
        return label.map((field) => item[field] ?? '').join('-');
      }
      return String(item[label] || '');
    };

    try {
      const response = await requestClient.post<{
        [key: string]: any[];
      }>('/core/contact/findUserExresList', {
        numbList,
      });

      const result = (response as any)?.result || response;
      const optionsMap: Record<string, SelectOption[]> = {};

      // 转换每个权限编码的选项
      // Transform each permission code's options
      Object.keys(result).forEach((code: string) => {
        const dataList = result[code] || [];
        optionsMap[code] = dataList.map((item: any) => ({
          label: getLabel(item),
          value: item[value],
          ...item, // 保留原始字段
        }));
      });

      return optionsMap;
    } catch (error) {
      console.error('[PermissionOptionsAdapter] Failed to load options:', error);
      return {};
    }
  },
};
