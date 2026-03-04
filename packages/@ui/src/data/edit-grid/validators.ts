interface ValidatorParams {
  row: any
  rule: any
  column: any
}

/**
 * 多字段关联校验（搭配 fieldNames 使用）
 * 
 * ⚠️ 此方法仅在使用 `fieldNames` 将区间值分别存储到不同字段时使用
 * 
 * 用于区间类型字段（如 InputRangeRender、RangePickerRender）的必填校验。
 * 当编辑器的 `params.fieldNames` 配置了 `start` 和 `end` 字段时，区间值会分别存储到指定的字段中，
 * 此时需要使用此方法分别对每个字段进行必填校验。
 * 
 * 使用场景：
 * - InputRangeRender 或 RangePickerRender 使用了 `fieldNames` 配置
 * - 需要分别校验区间的起始值和结束值
 * - 通过 rule.field 指定要校验的字段名（从 row 对象中读取）
 * 
 * @param params - 校验参数
 * @param params.row - 当前行数据
 * @param params.rule - 校验规则，其中 rule.field 指定要校验的字段名
 * @returns 校验通过返回 undefined，不通过返回 Error 对象
 * 
 * @example
 * ```typescript
 * const gridOptions = {
 *   columns: [
 *     {
 *       field: 'priceRange',
 *       ...EditRender.InputRangeRender,
 *       params: {
 *         fieldNames: { start: 'minPrice', end: 'maxPrice' }
 *       }
 *     }
 *   ],
 *   editRules: {
 *     priceRange: [
 *       { required: true, field: 'minPrice', message: '请输入最小价格', validator: Validators.requiredValidator },
 *       { required: true, field: 'maxPrice', message: '请输入最大价格', validator: Validators.requiredValidator },
 *     ]
 *   }
 * }
 * ```
 */
export const requiredValidator = ({ row, rule }: ValidatorParams) => {
  const value = row[rule.field]
  if (value === null || value === undefined || value === '') {
    return new Error(rule.message)
  }
}