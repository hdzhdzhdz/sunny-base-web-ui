export interface ImportModalOptions {
  templateUrl: string;
  uploadUrl: string;
  accept?: string;
  maxSize?: number;
  limit?: number;
  params?: Record<string, any>;
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: any) => void;
  onDownloadSuccess?: () => void;
  onDownloadError?: (error: any) => void;
}
