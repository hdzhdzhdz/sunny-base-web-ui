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

export function useForm({ schema = [], objectToValueFields, handleValuesChange, ...restProps }: UseFormOptions = {}) {
  // 使用声明式加载字典选项
  const { enhancedSchema: dictEnhancedSchema } = useSchemaOptionsLoader(schema)
  debugger
  // 使用声明式加载权限选项（在字典增强后的 Schema 上再增强）
  const { enhancedSchema: permissionEnhancedSchema } = useSchemaPermissionLoader(dictEnhancedSchema)

  return useSunnyForm({
    layout: 'horizontal',
    size: 'small',
    labelWidth: 100,
    gridProps: {
      xGap: 0,
      yGap: 0,
    },
    showDefaultActions: false,
    scrollToFirstError: true,
    schema: permissionEnhancedSchema.value,
    ...(objectToValueFields ? { objectToValueFields } : {}),
    ...(handleValuesChange ? { handleValuesChange } : {}),
    ...restProps, // 允许透传其他 SunnyFormProps
  })
}
