interface Option {
  label: string;
  value: string;
}

/**
 * 根据选项key、list返回对应name
 * @param {*} optionlist
 */
export function filterSelect(val: string, optionlist: Option[]) {
  const target = (optionlist || []).find(op => {
    return op.value == val
  })
  return target ? target.label : val
}