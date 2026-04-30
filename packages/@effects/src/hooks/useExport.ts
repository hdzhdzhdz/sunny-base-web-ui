import { useExportModalLight } from '@sunny-base-web/ui'
import type { ExportModalLightOptions, ExportModalLightOpenParams, ExportUserWebConfig } from '@sunny-base-web/ui'
import { useRouter } from 'vue-router'

export type { TableColumnInfo, ExportUserWebConfig } from '@sunny-base-web/ui'

export interface UseExportOptions {
  exportUrl?: string
  customExportUrl?: string
  exportUserWebConfig?: ExportUserWebConfig
  onExportSuccess?: ExportModalLightOptions['onExportSuccess']
  onExportError?: ExportModalLightOptions['onExportError']
}

export function useExport(options: UseExportOptions = {}) {
  const router = useRouter()

  const [ExportModal, exportModalApi] = useExportModalLight({
    exportUrl: options.exportUrl,
    customExportUrl: options.customExportUrl,
    exportUserWebConfig: options.exportUserWebConfig,
    onExportSuccess: options.onExportSuccess,
    onExportError: options.onExportError,
  })

  const open = (params: Omit<ExportModalLightOpenParams, 'exportUrl'> & { exportUrl?: string }) => {
    exportModalApi.open({
      ...params,
      exportUrl: params.exportUrl || options.exportUrl,
    })
  }

  return {
    ExportModal,
    exportModalApi,
    open,
  }
}
