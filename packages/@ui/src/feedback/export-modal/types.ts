export interface ExportColumnConfig {
  colProp: string;
  colName: string;
  colWidth?: number;
  colDataType?: 'default' | 'varchar' | 'number' | 'date';
  nSfExport: 0 | 1;
  colType?: string;
  selId?: string;
  selOpts?: any[];
}

export interface ExportUserWebConfig {
  showSheetRowNum?: boolean;
  nSheetRowNum?: string;
  hintSheetRowNum?: string;
  showMaxExportNumber?: boolean;
  maxExportNumber?: string;
  hintMaxExportNumber?: string;
}

export interface ExportInitResponse {
  exportList: ExportColumnConfig[];
  exportUserWebConfig: ExportUserWebConfig;
}

export interface ExportModalOptions {
  onExportSuccess?: (response: any) => void;
  onExportError?: (error: any) => void;
}

export interface ExportExecuteRequest {
  exportUrl: string;
  nmodid: number | string | unknown;
  nButtonid: number | string;
  conditionMap?: Record<string, any>;
}
