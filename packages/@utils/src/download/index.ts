/**
 * 将 Blob/File 保存为本地文件
 * @param data - 要保存的数据（Blob 或 File）
 * @param filename - 保存的文件名
 */
export function saveAs(data: Blob | File, filename: string): void {
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
