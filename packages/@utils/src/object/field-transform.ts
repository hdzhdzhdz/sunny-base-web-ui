/**
 * 字段值格式转换工具
 * 处理字符串 ↔ 对象数组 的双向转换
 * 用于 BusinessSearch、SearchInputTag 等组件的数据格式适配
 */

export interface FieldTransformOptions {
  /** 对象数组中 value 的 key，如 'ID'、'cBugcode' */
  valueKey: string;
  /** 对象数组中 label 的 key，如 'C_ROLENAME'、'cBugname' */
  labelKey: string;
}

/**
 * 将后端返回的字符串值转换为组件需要的对象数组格式
 *
 * @example
 * // 无 displayValue
 * transformToObjectArray('QX001,QX002', { valueKey: 'cBugcode', labelKey: 'cBugname' })
 * // => [{ cBugcode: 'QX001', cBugname: 'QX001' }, { cBugcode: 'QX002', cBugname: 'QX002' }]
 *
 * // 有 displayValue
 * transformToObjectArray('QX001,QX002', { valueKey: 'cBugcode', labelKey: 'cBugname' }, '划伤,压伤')
 * // => [{ cBugcode: 'QX001', cBugname: '划伤' }, { cBugcode: 'QX002', cBugname: '压伤' }]
 */
export function transformToObjectArray(
  value: string,
  options: FieldTransformOptions,
  displayValue?: string,
): Record<string, any>[] {
  const values = value.split(',').map(v => v.trim()).filter(v => v !== '');
  const labels = displayValue
    ? displayValue.split(',').map(v => v.trim())
    : values;

  return values.map((v, i) => ({
    [options.valueKey]: v,
    [options.labelKey]: labels[i] || v,
  }));
}

/**
 * 将组件的对象数组转换回后端需要的字符串格式
 *
 * @example
 * transformToString(
 *   [{ cBugcode: 'QX001', cBugname: '划伤' }, { cBugcode: 'QX002', cBugname: '压伤' }],
 *   { valueKey: 'cBugcode', labelKey: 'cBugname' }
 * )
 * // => { value: 'QX001,QX002', displayValue: '划伤,压伤' }
 */
export function transformToString(
  data: Record<string, any>[],
  options: FieldTransformOptions,
): { value: string; displayValue: string } {
  const value = data
    .map(item => typeof item === 'object' ? item[options.valueKey] : item)
    .filter(v => v !== undefined && v !== null)
    .join(',');

  const displayValue = data
    .map(item => typeof item === 'object' ? item[options.labelKey] : item)
    .filter(v => v !== undefined && v !== null)
    .join(',');

  return { value, displayValue };
}
