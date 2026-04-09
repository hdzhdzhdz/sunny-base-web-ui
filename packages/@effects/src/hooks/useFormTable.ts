import { useSunnyForm } from '@sunny-base-web/ui'
import { useSunnyEditGrid } from '@sunny-base-web/ui'
import { useSchemaOptionsLoader } from '../utils/use-schema-options-loader'
import { useSchemaPermissionLoader } from '../utils/use-schema-permission-loader'
import { useSelectOptions } from '../form/use-select-options'
import { reactive, watch } from 'vue'
import type { VxeGridProps } from '@sunny-base-web/ui'

interface UseFormTableOptions {
  formSchema?: any[]
  tableColumns?: VxeGridProps['columns']
  tableEditRules?: any
  tableToolbarButtons?: Array<{ code: string; name: string }>
  objectToValueFields?: string[]
}

export function useFormTable({
  formSchema = [],
  tableColumns = [],
  tableEditRules = {},
  tableToolbarButtons = [],
  objectToValueFields
}: UseFormTableOptions = {}) {
  // 使用声明式加载字典选项
  const { enhancedSchema: dictEnhancedSchema } = useSchemaOptionsLoader(formSchema)

  // 使用声明式加载权限选项（在字典增强后的 Schema 上再增强）
  const { enhancedSchema: permissionEnhancedSchema } = useSchemaPermissionLoader(dictEnhancedSchema)

  // 收集表格列中的字典编码
  const collectDictCodes = () => {
    const codes = new Set<string>()
    tableColumns.forEach(column => {
      if (column.selectOptions?.dictCode) {
        codes.add(column.selectOptions.dictCode)
      }
    })
    return Array.from(codes)
  }

  // 加载表格字典选项
  const dictCodes = collectDictCodes()
  const { optionsMap, load } = useSelectOptions({
    numbList: dictCodes,
    immediate: false
  })
  
  // 立即加载字典选项
  if (dictCodes.length > 0) {
    load()
  }

  // 初始化表单
  const [Form, formApi] = useSunnyForm({
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

  // 处理表格列，注入字典选项
  const processColumns = (columns: any[]) => {
    return columns.map(column => {
      if (column.selectOptions?.dictCode) {
        const dictCode = String(column.selectOptions.dictCode)
        const options = optionsMap.value[dictCode] || []
        
        return {
          ...column,
          params: {
            ...column.params,
            options
          }
        }
      }
      return column
    })
  }

  // 使用reactive创建表格配置，确保列配置的变化能够触发组件重新渲染
  const gridOptions = reactive({
    id: 'meta-grid',
    columns: processColumns(tableColumns),
    data: [] as any[],
    editRules: tableEditRules,
    editConfig: {
      enabled: true,
      trigger: 'click',
      mode: 'row'
    },
    height: 'auto',
    toolbarConfig: {
      enabled: true,
      zoom: true,
      custom: true,
      buttons: tableToolbarButtons
    },
    zoomConfig: {
      enabled: true
    },
    customConfig: {
      storage: true,
      mode: 'popup',
      visibleMethod: (params: any) => {
        return !(params.column.type === 'checkbox' || params.column.type === 'seq')
      }
    }
  })

  // 监听字典选项变化，更新表格列
  watch(() => optionsMap.value, () => {
    gridOptions.columns = processColumns(tableColumns)
  }, { deep: true })

  // 初始化表格
  const [Grid, gridApi] = useSunnyEditGrid({
    gridOptions
  })

  // 包装reloadData方法，确保数据更新
  const originalReloadData = gridApi.reloadData
  gridApi.reloadData = (data: any[]) => {
    gridOptions.data = data
    return originalReloadData(data)
  }

  return [Form, formApi, Grid, gridApi] as const
}