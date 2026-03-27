import { useSunnyForm } from '@sunny-base-web/ui'

interface UseFormOptions {
  schema?: any[]
  objectToValueFields?: string[]
}

export function useForm({ schema = [], objectToValueFields }: UseFormOptions = {}) {
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
    schema,
    ...(objectToValueFields ? { objectToValueFields } : {})
  })
}
