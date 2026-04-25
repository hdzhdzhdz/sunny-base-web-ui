/**
 * Parser - 代码解析模块（待实现）
 *
 * 职责：将 Vue SFC 源码反向解析为 ProjectModel / BlockModel 数据结构。
 *
 * 计划功能：
 * - 解析 <template> 生成 NodeModel 节点树
 * - 解析 <script setup> 提取 state / computed / methods / watch 等声明
 * - 解析 <style> 提取 CssBlock 样式块
 * - 解析 defineProps / defineEmits / defineExpose 等编译宏
 * - 支持从现有项目导入页面，实现「源码 → 可视化编辑」
 *
 * 使用示例（计划）：
 * ```ts
 * import { SfcParser } from './parser'
 * const parser = new SfcParser()
 * const blockModel = parser.parse(sfcSourceCode)
 * ```
 *
 * 技术选型参考：
 * - @vue/compiler-sfc（Vue 官方 SFC 解析器）
 * - @vue/compiler-dom（模板 AST 解析）
 */
export {}
