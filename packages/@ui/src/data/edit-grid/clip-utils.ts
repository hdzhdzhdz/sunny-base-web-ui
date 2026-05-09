/**
 * 检查列是否可编辑且未禁用
 * 通过 editRender 和 slots 判断，同时兼容 vxe-table 内部 ColumnInfo 对象
 */
function isColumnEditable(column: any): boolean {
  if (!column.editRender) return false
  if (column.params?.disabled === true) return false
  // 兼容 vxe-table ColumnInfo：原始列定义可能通过 own 属性存储
  const colDef = column.own || column
  // 有 edit 插槽才是真正可编辑的列（SpanRender 等只有 default 插槽会被跳过）
  if (!colDef.slots?.edit) return false
  return true
}

/**
 * 创建支持可编辑性检测的剪贴板配置
 * 剪切/粘贴操作会检查目标列是否可编辑且未禁用，不可编辑的列自动跳过
 */
export function createEditableClipConfig() {
  return {
    isCopy: true,
    cutMethod: ({ row, column }: any) => {
      if (!isColumnEditable(column)) return
      if (column.field) {
        row[column.field] = null
      }
    },
    pasteMethod: ({ row, column, cellValue }: any) => {
      if (!isColumnEditable(column)) return
      if (column.field) {
        row[column.field] = cellValue
      }
    },
  }
}
