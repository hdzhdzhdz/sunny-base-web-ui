import { useSunnyForm } from '@sunny-base-web/ui'
import { useSchemaOptionsLoader } from '../utils/use-schema-options-loader'
import { useSchemaPermissionLoader } from '../utils/use-schema-permission-loader'
import { applyAutoSelectDefaults } from '../utils/apply-auto-select-defaults'
import type { SunnyFormProps } from '@sunny-base-web/ui'

interface UseFormOptions extends Partial<SunnyFormProps> {
  schema?: any[]
  objectToValueFields?: string[]
  /**
   * 表单值变化时的回调
   * Callback when form values change
   */
  handleValuesChange?: (values: Record<string, any>, changedFields: string[]) => void
}

/** useForm 的默认配置，外部可 import 后进行覆盖/合并 */
export const USE_FORM_DEFAULTS: Partial<SunnyFormProps> = {
  layout: 'vertical',
  size: 'mini',
  labelWidth: 'auto',
  gridProps: {
    xGap: 8,
    yGap: 0,
  },
  commonConfig: {
    colProps: { span: 24, lg: 8, xl: 6 },
  },
  showDefaultActions: false,
  scrollToFirstError: true,
} as const

export function useForm({ schema = [], objectToValueFields, handleValuesChange, ...restProps }: UseFormOptions = {}) {
  // 使用声明式加载字典选项
  const { enhancedSchema: dictEnhancedSchema } = useSchemaOptionsLoader(schema)

  let _formApi: any;
  // 使用声明式加载权限选项（在字典增强后的 Schema 上再增强）
  const { enhancedSchema: permissionEnhancedSchema } = useSchemaPermissionLoader(dictEnhancedSchema, {
    onAutoSelect: (defaults) => applyAutoSelectDefaults(defaults, _formApi),
  })

  const formResult = useSunnyForm({
    ...USE_FORM_DEFAULTS,
    schema: permissionEnhancedSchema.value,
    ...(objectToValueFields ? { objectToValueFields } : {}),
    ...(handleValuesChange ? { handleValuesChange } : {}),
    ...restProps, // 允许透传其他 SunnyFormProps，优先级最高
  })

  _formApi = formResult[1]

  return formResult
}
