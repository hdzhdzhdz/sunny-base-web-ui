import { useSunnyEditGrid } from '@sunny-base-web/ui'
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
  }

  if (editable) {
    gridOptions.editRules = editRules
    gridOptions.editConfig = {
      enabled: true,
      trigger: editTrigger,
      mode: editMode,
    }
  }

  if (toolbarButtons.length > 0) {
    gridOptions.toolbarConfig = {
      enabled: true,
      zoom: true,
      custom: true,
      buttons: toolbarButtons,
    }
    gridOptions.zoomConfig = { enabled: true }
    gridOptions.customConfig = {
      storage: true,
      mode: 'popup',
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

  // 包装 gridApi，增强方法
  const originalReloadData = gridApi.reloadData
  const enhancedGridApi = {
    ...gridApi,
    reloadData: (newData: any[]) => {
      reactiveGridOptions.data = newData
      return originalReloadData(newData)
    },
    setColumns: (newColumns: any[]) => {
      reactiveGridOptions.columns = processColumns(newColumns)
    },
  }

  return [Grid, enhancedGridApi] as const
}
