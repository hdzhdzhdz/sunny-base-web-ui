/**
 * 内置物料定义
 *
 * 提供 Sunny 组件、Arco 组件和原生 HTML 元素的物料元数据。
 * 通过 createBuiltinMaterials() 统一创建，可按需 filter/extend 后注册到 MaterialStore。
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
