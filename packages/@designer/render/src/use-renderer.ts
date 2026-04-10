/**
 * useRenderer - 渲染器 Composable
 *
 * 基于 createRenderer + createLoader 的高层封装。
 *
 * @example
 * ```ts
 * const { RendererComponent, loader } = useRenderer({
 *   block: blockJSON,
 *   materialStore,
 *   mode: 'preview',
 * })
 * ```
 */
import { ref, computed, type Ref, type Component } from 'vue'
import type { BlockModelJSON } from '@sunny-base-web/designer-core'
import type { MaterialStore } from '@sunny-base-web/designer-materials'
import { RenderContext } from './context'
import { createLoader, type ComponentLoader } from './loader'
import { createRenderer } from './block'

export interface UseRendererOptions {
  /** 物料存储 */
  materialStore: MaterialStore
  /** BlockModelJSON 数据（预览态需要） */
  block?: BlockModelJSON | null
  /** 渲染模式，默认 'design' */
  mode?: 'design' | 'preview'
  /** Schema 异步加载函数（可选） */
  schemaLoader?: (id: string) => Promise<BlockModelJSON>
}

export interface UseRendererReturn {
  /** 物料存储 */
  materialStore: MaterialStore
  /** 组件加载器 */
  loader: ComponentLoader
  /** 渲染器组件（computed，block 变化时自动更新） */
  RendererComponent: Ref<Component | null>
  /** RenderContext 实例（设计态为 null） */
  context: Ref<RenderContext | null>
  /** 是否为预览模式 */
  isPreview: Ref<boolean>
}

export function useRenderer(options: UseRendererOptions): UseRendererReturn {
  const { materialStore, mode = 'design' } = options

  const context: Ref<RenderContext | null> = ref<RenderContext | null>(null) as Ref<RenderContext | null>
  const isPreview = ref(mode === 'preview')

  // 创建 loader
  const loader = createLoader({
    materialStore,
    schemaLoader: options.schemaLoader,
  })

  // 渲染器组件
  const RendererComponent = computed(() => {
    if (!options.block?.rootNode) return null
    return createRenderer(options.block, loader, { mode })
  })

  return {
    materialStore,
    loader,
    RendererComponent,
    context,
    isPreview,
  }
}
