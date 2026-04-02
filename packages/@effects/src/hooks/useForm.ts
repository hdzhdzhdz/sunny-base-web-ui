import { useSunnyForm } from '@sunny-base-web/ui'
import { useSchemaOptionsLoader } from '../utils/use-schema-options-loader'

interface UseFormOptions {
  schema?: any[]
  objectToValueFields?: string[]
}

export function useForm({ schema = [], objectToValueFields }: UseFormOptions = {}) {
  // 使用声明式加载选项
  const { enhancedSchema } = useSchemaOptionsLoader(schema)
  
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
    schema: enhancedSchema.value,
    ...(objectToValueFields ? { objectToValueFields } : {})
  })
}
