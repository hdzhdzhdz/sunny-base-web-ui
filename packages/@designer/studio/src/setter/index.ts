/**
 * Setter 属性面板模块入口
 *
 * 导出属性面板读写管理类和字段类型。
 *
 * ## 模块内容
 *
 * | 导出 | 说明 |
 * |------|------|
 * | `Setter` | 属性面板读写管理类（桥接 Engine ↔ NodeModel） |
 * | `SetterField` | 属性面板字段类型（合并 schema + 实际值） |
 */
export { Setter } from './setter'
export type { SetterField } from './setter'
