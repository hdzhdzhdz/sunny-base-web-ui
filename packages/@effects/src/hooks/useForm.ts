import { useSunnyForm } from '@sunny-base-web/ui'
import { useSchemaOptionsLoader } from '../utils/use-schema-options-loader'
import { useSchemaPermissionLoader } from '../utils/use-schema-permission-loader'
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
  layout: 'horizontal',
  size: 'small',
  labelWidth: 100,
  gridProps: {
    xGap: 0,
    yGap: 0,
  },
  commonConfig: {
    colProps: { span: 24, lg: 6, xl: 4 },
  },
  showDefaultActions: false,
  scrollToFirstError: true,
} as const

export function useForm({ schema = [], objectToValueFields, handleValuesChange, ...restProps }: UseFormOptions = {}) {
  // 使用声明式加载字典选项
  const { enhancedSchema: dictEnhancedSchema } = useSchemaOptionsLoader(schema)
  // 使用声明式加载权限选项（在字典增强后的 Schema 上再增强）
  const { enhancedSchema: permissionEnhancedSchema } = useSchemaPermissionLoader(dictEnhancedSchema)

  return useSunnyForm({
    ...USE_FORM_DEFAULTS,
    schema: permissionEnhancedSchema.value,
    ...(objectToValueFields ? { objectToValueFields } : {}),
    ...(handleValuesChange ? { handleValuesChange } : {}),
    ...restProps, // 允许透传其他 SunnyFormProps，优先级最高
  })
}
