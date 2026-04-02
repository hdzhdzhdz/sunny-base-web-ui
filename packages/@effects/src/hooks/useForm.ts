import { useSunnyForm } from '@sunny-base-web/ui'
import { useSchemaOptionsLoader } from '../utils/use-schema-options-loader'
import { useSchemaPermissionLoader } from '../permission'

interface UseFormOptions {
  schema?: any[]
  objectToValueFields?: string[]
}

export function useForm({ schema = [], objectToValueFields }: UseFormOptions = {}) {
  // 使用声明式加载字典选项
  const { enhancedSchema: dictEnhancedSchema } = useSchemaOptionsLoader(schema)

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
    ...(objectToValueFields ? { objectToValueFields } : {})
  })
}
