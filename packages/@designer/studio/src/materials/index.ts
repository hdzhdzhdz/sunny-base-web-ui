/**
 * 内置物料定义入口
 *
 * 提供 Sunny 组件、Arco 组件和原生 HTML 元素的物料元数据（ComponentMeta）。
 * 通过 createBuiltinMaterials() 统一创建，可按需 filter/extend 后注册到 MaterialStore。
 *
 * ## 物料分类
 *
 * | 分类 | 文件 | 说明 |
 * |------|------|------|
 * | Sunny 表单组件 | `sunny-form.ts`, `sunny-select.ts` | @ui 包的表单组件 |
 * | Arco 组件 | `arco-button.ts`, `arco-input.ts`, `arco-textarea.ts` | Arco Design Vue 组件 |
 * | 原生元素 | `native-elements.ts` | div/span/p/h1-h6 等原生标签 |
 *
 * @example
 * ```ts
 * const materialStore = new MaterialStore()
 * materialStore.registerAll(createBuiltinMaterials())
 * ```
 */
import type { ComponentMeta } from '@sunny-base-web/designer-materials'
import { createNativeElementMetas } from './native-elements'
import { createSunnyFormMeta } from './sunny-form'
import { createSunnySelectMeta } from './sunny-select'
import { createArcoButtonMeta } from './arco-button'
import { createArcoInputMeta } from './arco-input'
import { createArcoTextareaMeta } from './arco-textarea'

/**
 * 创建内置物料列表
 *
 * @returns 包含所有内置物料元数据的数组
 */
export function createBuiltinMaterials(): ComponentMeta[] {
  return [
    // Sunny 表单组件
    createSunnyFormMeta(),
    createSunnySelectMeta(),

    // Arco Design 组件
    createArcoButtonMeta(),
    createArcoInputMeta(),
    createArcoTextareaMeta(),

    // 原生 HTML 元素
    ...createNativeElementMetas(),
  ]
}
