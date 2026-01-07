/**
 * 提取错误对象的详细信息
 *
 * 递归遍历错误对象的所有属性，提取可访问的属性值，
 * 同时处理循环引用问题，避免无限递归
 *
 * @param err - 要分析的错误对象
 * @param seen - 用于跟踪已访问对象的 WeakSet，防止循环引用
 * @returns 包含错误详细信息的对象
 */
export function getErrorDetails(err: any, seen = new WeakSet()): any {
  // Handle circular references
  if (err === null || typeof err !== 'object' || seen.has(err)) {
    return err
  }

  seen.add(err)
  const result: any = {}

  // Get all enumerable properties, including those from the prototype chain
  const allProps = new Set([...Object.getOwnPropertyNames(err), ...Object.keys(err)])

  for (const prop of allProps) {
    try {
      const value = err[prop]
      // Skip function properties
      if (typeof value === 'function') continue
      // Recursively process nested objects
      result[prop] = getErrorDetails(value, seen)
    } catch (e) {
      result[prop] = '<Unable to access property>'
    }
  }

  return result
}

/**
 * 格式化错误信息为可读的字符串
 *
 * 将错误对象转换为格式化的 JSON 字符串，
 * 自动过滤掉敏感信息（如 headers、stack、request_id）
 *
 * @param error - 要格式化的错误对象
 * @returns 格式化后的错误信息字符串
 */
export function formatErrorMessage(error: any): string {
  try {
    const detailedError = getErrorDetails(error)
    delete detailedError?.headers
    delete detailedError?.stack
    delete detailedError?.request_id

    const formattedJson = JSON.stringify(detailedError, null, 2)
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n')
    return `Error Details:\n${formattedJson}`
  } catch (e) {
    try {
      return `Error: ${String(error)}`
    } catch {
      return 'Error: Unable to format error message'
    }
  }
}
