import { useSunnyForm, useSunnyEditGrid, createEditableClipConfig } from '@sunny-base-web/ui'
import { useSchemaOptionsLoader } from '../utils/use-schema-options-loader'
import { useSchemaPermissionLoader } from '../utils/use-schema-permission-loader'
import { applyAutoSelectDefaults } from '../utils/apply-auto-select-defaults'
import { useSelectOptions } from '../form/use-select-options'
import { ref, computed, shallowRef, markRaw, reactive, watch } from 'vue'
import type { VxeGridProps } from '@sunny-base-web/ui'

interface TabConfig {
  title: string
  type: 'grid' | 'form'
  gridConfig?: {
    columns: VxeGridProps['columns']
    editRules: any
    toolbarButtons?: Array<{ code: string; name: string }>
  }
}

interface UseFormTabsOptions {
  formSchema?: any[]
  tabsConfig?: TabConfig[]
  objectToValueFields?: string[]
}

export function useFormTabs({
  formSchema = [],
  tabsConfig = [],
  objectToValueFields
}: UseFormTabsOptions = {}) {
  // 使用声明式加载字典选项
  const { enhancedSchema: dictEnhancedSchema } = useSchemaOptionsLoader(formSchema)

  let _formApi: any;
  // 使用声明式加载权限选项（在字典增强后的 Schema 上再增强）
  const { enhancedSchema: permissionEnhancedSchema } = useSchemaPermissionLoader(dictEnhancedSchema, {
    onAutoSelect: (defaults) => applyAutoSelectDefaults(defaults, _formApi),
  })

  // 收集表格列中的字典编码
  const collectDictCodes = () => {
    const codes = new Set<string>()
    tabsConfig.forEach(tab => {
      if (tab.type === 'grid' && tab.gridConfig) {
        tab.gridConfig.columns.forEach(column => {
          if (column.selectOptions?.dictCode) {
            codes.add(column.selectOptions.dictCode)
          }
        })
      }
    })
    const result = Array.from(codes)
    return result
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

  _formApi = formApi

  // 初始化表格组件和API数组
  const gridComponents = shallowRef<any[]>([])
  const gridApis = ref<any[]>([])

  // 遍历标签页配置，为每个grid类型的标签页创建表格实例
  tabsConfig.forEach((tab, index) => {
    if (tab.type === 'grid' && tab.gridConfig) {
      // 创建响应式的gridOptions
      const gridOptions = reactive({
        id: `grid-${index}`,
        columns: tab.gridConfig.columns,
        data: [] as any[],
        editRules: tab.gridConfig.editRules,
        height: 'auto',
        clipConfig: createEditableClipConfig(),
        toolbarConfig: {
          enabled: tab.gridConfig.toolbarButtons && tab.gridConfig.toolbarButtons.length > 0,
          zoom: true,
          custom: true,
          buttons: tab.gridConfig.toolbarButtons || []
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

      // 监听optionsMap变化，更新表格列的字典选项
      watch(() => optionsMap.value, (newOptions) => {
        gridOptions.columns = gridOptions.columns.map(column => {
          if (column.selectOptions?.dictCode) {
            const dictCode = String(column.selectOptions.dictCode)
            const options = newOptions[dictCode] || []
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
      }, { deep: true })

      const [GridComponent, gridApi] = useSunnyEditGrid({
        gridOptions
      })

      // 包装reloadData方法，确保数据更新能触发响应式变化
      const enhancedGridApi = {
        ...gridApi,
        reloadData: (data: any[]) => {
          gridOptions.data = data
          return gridApi.reloadData(data)
        },
        validate: () => gridApi.validate(),
        getFullData: () => gridApi.getFullData()
      }

      gridComponents.value.push(markRaw(GridComponent))
      gridApis.value.push(enhancedGridApi)
    }
  })

  return [Form, formApi, gridComponents, gridApis] as const
}