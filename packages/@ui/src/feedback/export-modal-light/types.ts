import type { ExportColumnConfig, ExportUserWebConfig } from '../export-modal/types'

export type { ExportColumnConfig, ExportUserWebConfig }

export interface TableColumnInfo {
  type?: string | number | null
  field?: string
  title?: string | number
  width?: number
  minWidth?: number
  params?: {
    optionlist?: Array<{ label: string; value: string | number }>
    [key: string]: any
  }
  [key: string]: any
}

export interface ExportModalLightOptions {
  onExportSuccess?: (response: any) => void
  onExportError?: (error: any) => void
}

export interface ExportModalLightOpenParams {
  exportUrl?: string
  customExportUrl?: string
  conditionMap?: Record<string, any>
  tableColumns: TableColumnInfo[]
  exportUserWebConfig?: ExportUserWebConfig
}

export function tableColumnsToExportList(columns: TableColumnInfo[]): ExportColumnConfig[] {
  return columns
    .filter(col => col.field && col.type !== 'checkbox' && col.type !== 'seq' && col.type !== 'radio')
    .map(col => {
      const selOpts = col.params?.optionlist
      return {
        colProp: col.field!,
        colName: String(col.title || col.field!),
        colWidth: col.width ?? col.minWidth,
        colDataType: 'default' as const,
        colType: 'spanselect',
        nSfExport: 1 as const,
        ...(selOpts && selOpts.length > 0
          ? { selOpts, selId: '' }
          : {}),
      }
    })
}
