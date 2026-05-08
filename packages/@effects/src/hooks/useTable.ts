import { useSunnyEditGrid, createEditableClipConfig } from '@sunny-base-web/ui'
import { useSelectOptions } from '../form/use-select-options'
import { reactive, watch } from 'vue'
import type { VxeGridProps } from '@sunny-base-web/ui'

interface UseTableOptions {
  /** 表格列配置 */
  columns?: VxeGridProps['columns']
  /** 表格编辑规则 */
  editRules?: any
  /** 工具栏按钮 */
  toolbarButtons?: Array<{ code: string; name: string }>
  /** 表格数据 */
  data?: any[]
  /** 是否启用编辑，默认 false */
  editable?: boolean
  /** 编辑触发方式 */
  editTrigger?: 'click' | 'dblclick'
  /** 编辑模式 */
  editMode?: 'row' | 'cell'
  /** 表格高度 */
  height?: string | number
  /** 表格 ID */
  gridId?: string
  /** 表格事件 */
  gridEvents?: Record<string, (...args: any[]) => any>
  /** 全局溢出提示，默认 false */
  showOverflow?: boolean | 'tooltip' | 'ellipsis'
  /** 聚合配置（用于行分组等场景） */
  aggregateConfig?: { groupFields?: string[]; [key: string]: any }
}

export function useTable({
  columns = [],
  editRules,
  toolbarButtons = [],
  data = [],
  editable = false,
  editTrigger = 'click',
  editMode = 'row',
  height = 'auto',
  gridId = 'table-grid',
  gridEvents,
  showOverflow = 'tooltip',
  aggregateConfig,
}: UseTableOptions = {}) {
  // 收集表格列中的字典编码
  const collectDictCodes = () => {
    const codes = new Set<string>()
    columns.forEach((column: any) => {
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
    immediate: false,
  })

  if (dictCodes.length > 0) {
    load()
  }

  // 处理表格列，注入字典选项
  const processColumns = (cols: any[]) => {
    return cols.map((column: any) => {
      if (column.selectOptions?.dictCode) {
        const dictCode = String(column.selectOptions.dictCode)
        const options = optionsMap.value[dictCode] || []
        return {
          ...column,
          params: {
            ...column.params,
            options,
          },
        }
      }
      return column
    })
  }

  // 构建表格配置
  const gridOptions: Record<string, any> = {
    id: gridId,
    columns: processColumns(columns),
    data,
    height,
    size: 'mini',
    showOverflow,
    columnConfig: {
      resizable: true
    },
    toolbarConfig: {
      refresh: false,
      zoom: true,
      custom: true,
    },
    customConfig: {
      mode: 'popup',
      storage: true,
    },
    ...(aggregateConfig && { aggregateConfig }),
  }

  if (editable) {
    gridOptions.editRules = editRules
    gridOptions.clipConfig = createEditableClipConfig()
  }

  if (toolbarButtons.length > 0) {
    gridOptions.toolbarConfig = {
      ...gridOptions.toolbarConfig,
      enabled: true,
      buttons: toolbarButtons,
    }
    gridOptions.zoomConfig = { enabled: true }
    gridOptions.customConfig = {
      ...gridOptions.customConfig,
      visibleMethod: (params: any) => {
        return !(params.column.type === 'checkbox' || params.column.type === 'seq')
      },
    }
  }

  const reactiveGridOptions = reactive(gridOptions)

  // 监听字典选项变化，更新表格列
  watch(() => optionsMap.value, () => {
    reactiveGridOptions.columns = processColumns(columns)
  }, { deep: true })

  // 初始化表格
  const [Grid, gridApi] = useSunnyEditGrid({
    gridOptions: reactiveGridOptions,
    gridEvents,
  })

  // 增强 gridApi
  const originalReloadData = gridApi.reloadData.bind(gridApi)
  const enhancedApi = gridApi as typeof gridApi & {
    setColumns: (newColumns: any[]) => void
    setToolbarButtons: (buttons: Array<{ code: string; name: string }>) => void
  }

  enhancedApi.reloadData = (newData: any[]) => {
    reactiveGridOptions.data = newData
    return originalReloadData(newData)
  }
  enhancedApi.setColumns = (newColumns: any[]) => {
    reactiveGridOptions.columns = processColumns(newColumns)
  }
  enhancedApi.setToolbarButtons = (buttons: Array<{ code: string; name: string }>) => {
    reactiveGridOptions.toolbarConfig = {
      ...reactiveGridOptions.toolbarConfig,
      enabled: true,
      buttons,
    }
    if (!reactiveGridOptions.zoomConfig) {
      reactiveGridOptions.zoomConfig = { enabled: true }
    }
  }

  // Proxy 将未定义的方法委托给 VxeGrid 实例
  const proxyApi = new Proxy(enhancedApi, {
    get(target, prop) {
      const value = Reflect.get(target, prop)
      if (value !== undefined) {
        return typeof value === 'function' ? value.bind(target) : value
      }
      const grid = target.$grid
      if (grid) {
        const gridValue = Reflect.get(grid, prop)
        if (gridValue !== undefined) {
          return typeof gridValue === 'function' ? gridValue.bind(grid) : gridValue
        }
      }
      return undefined
    },
  })

  return [Grid, proxyApi] as const
}
