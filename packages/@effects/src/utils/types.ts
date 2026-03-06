export interface ButtonItem {
  label: string
  handle: string
  icon: string
  class: string
  order: number
  loading: boolean
  size: 'mini' | 'small' | 'medium'
  nButtonid: number
  cEvent: string
  cSubArea: string
  // vxe-grid 按钮配置项
  name: string
  code: string
}

export interface FormItem {
  components: string
  label: string
  fieldName: string
  componentProps: any
  hidden: boolean // 是否隐藏字段（静态隐藏，不参与联动逻辑）。
  rules: string | null
  colSpan: number // 简化的栅格跨度设置 (1-24)。
  defaultValue: string | number | boolean | null // 字段默认值。
  order: number
  dependencies?: any
}