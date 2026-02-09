import type { VxeGridPropTypes } from 'vxe-table';
import type { FormSchema } from '../../../entry/form/types';
import type { DynamicConfigResponse, BusinessSearchConfig } from '../types';

/**
 * 映射组件类型
 * @param type 后端返回的组件类型
 */
function mapComponentType(type: string): string {
  const map: Record<string, string> = {
    input: 'Input',
    select: 'Select',
    date: 'DatePicker',
    datetime: 'TimePicker', // 假设 TimePicker 或 DatePicker 支持时间
    // 可根据实际情况补充更多映射
  };
  return map[type] || 'Input';
}

/**
 * 映射表单配置
 * @param conditions 后端返回的查询条件
 */
function mapFormSchema(conditions: DynamicConfigResponse['conditions']): FormSchema[] {
  return conditions.map((item) => {
    return {
      label: item.label,
      fieldName: item.prop,
      component: mapComponentType(item.type) as any,
      componentProps: {
        placeholder: item.meta?.placeholder || `请输入${item.label}`,
        ...item.meta,
      },
            // 默认占据 8 栅格 (一行3个)
      // colProps: { span: 8 },
    };
  });
}

/**
 * 映射表格列配置
 * @param tableCols 后端返回的表格列
 */
function mapTableColumns(tableCols: DynamicConfigResponse['tableCols']): VxeGridPropTypes.Columns {
  return tableCols.map((item) => ({
    title: item.label,
    field: item.prop,
    width: item.width,
    // 可选：处理对齐方式、格式化等
  }));
}

/**
 * 将后端动态配置映射为 SunnySearchModal 可识别的配置
 * @param res 后端返回的动态配置
 */
export function mapDynamicConfig(res: DynamicConfigResponse): Partial<BusinessSearchConfig> {
  return {
    title: res.cTitle,
    width: res.cWidth ? (isNaN(Number(res.cWidth)) ? res.cWidth : `${res.cWidth}px`) : undefined,
    contentHeight: res.cHeight ? (isNaN(Number(res.cHeight)) ? res.cHeight : Number(res.cHeight)) : 300,
    multiple: res.cSelectionMode === 'single' ? false : true,
    formSchema: mapFormSchema(res.conditions),
    tableColumns: mapTableColumns(res.tableCols),
    // 动态配置模式下，searchApi 在组件内部通过 createSearchProxy 动态生成，此处无需映射
  };
}

/**
 * 映射查询参数
 * @param params SunnySearchModal 传出的查询参数
 * @param cNum 动态配置编码
 */
export function mapSearchRequest(params: any, cNum: string) {
  const { pageNo, pageSize, ...conditions } = params;
  return {
    pageNo,
    pageSize,
    sqlNum: cNum,
    conditions,
  };
}
