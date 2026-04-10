/**
 * createRenderer - 编译入口
 *
 * 将 BlockModelJSON 编译为 Vue defineComponent。
 * 是整个渲染引擎的最上层入口，组合 block/node/loader/context 四层。
 *
 * setup() 中初始化 RenderContext（state/methods/computed/watch/lifecycle），
 * render() 中调用 renderNode() 递归渲染 rootNode。
 *
 * @example
 * ```ts
 * const BlockComponent = createRenderer(blockJSON, loader, { mode: 'preview' })
 * // BlockComponent 是一个 Vue 组件，可直接在 h() 或 template 中使用
 * ```
 */
import { defineComponent, h, reactive, ref, computed, watch, onMounted, onUnmounted, onUpdated } from 'vue'
import type { Component } from 'vue'
import type { BlockModelJSON, LifecycleHook } from '@sunny-base-web/designer-core'
import { RenderContext, parseValue } from './context'
import { renderNode } from './node'
import type { ComponentLoader } from './loader'

/**
 * 生命周期钩子名到 Vue API 的映射
 */
const LIFECYCLE_MAP: Record<string, (fn: () => void) => void> = {
  onMounted,
  onUnmounted,
  onUpdated,
}

/**
 * 创建渲染器选项
 */
export interface CreateRendererOptions {
  /**
   * 渲染模式
   * - 'design'：设计态，不执行表达式，注入 DOM 标记
   * - 'preview'：预览态，完整运行时能力
   * @default 'preview'
   */
  mode?: 'design' | 'preview'
}

/**
 * 创建渲染器
 *
 * 将 BlockModelJSON 编译为 Vue Component。
 *
 * @param block - Block 的 JSON 数据
 * @param loader - 组件加载器
 * @param options - 渲染选项
 * @returns Vue Component（defineComponent 产物）
 */
export function createRenderer(
  block: BlockModelJSON,
  loader?: ComponentLoader,
  options?: CreateRendererOptions,
): Component {
  const mode = options?.mode ?? 'preview'

  return defineComponent({
    name: block.name || 'BlockRenderer',

    setup() {
      // ── 1. 创建 RenderContext
      const ctx = new RenderContext()

      // ── 2. 初始化 state
      for (const decl of block.state) {
        const parsed = parseValue(decl.value)
        ctx.state[decl.name] = isSimpleType(parsed) ? ref(parsed) : reactive(parsed)
      }

      // ── 3. 初始化 methods
      for (const decl of block.methods) {
        ctx.state[decl.name] = ctx.parseFunction(decl.value, decl.params)
      }

      // ── 4. 初始化 computed
      for (const decl of block.computed) {
        const getter = ctx.evaluate.bind(ctx)
        const expr = decl.value
        ctx.state[decl.name] = computed(() => {
          try {
            const fn = new Function('__ctx__', `with(__ctx__) { return (${expr}) }`)
            return fn(ctx.state)
          } catch {
            return undefined
          }
        })
      }

      // ── 5. 注册 watch
      const stopWatchers: (() => void)[] = []
      for (const decl of block.watch) {
        const source = ctx.state[decl.name]
        if (!source) continue

        const params = decl.params ?? ['newVal', 'oldVal']
        const stop = watch(
          source,
          (...args: any[]) => {
            ctx.parseFunction(decl.value, params)(...args)
          },
        )
        stopWatchers.push(stop)
      }

      // ── 6. 注册生命周期钩子
      for (const hook of block.lifecycleHooks) {
        const registerFn = LIFECYCLE_MAP[hook.name]
        if (!registerFn) {
          console.warn(`[createRenderer] Unknown lifecycle hook: ${hook.name}`)
          continue
        }
        registerFn(() => {
          ctx.parseFunction(hook.value)()
        })
      }

      // ── 清理
      onUnmounted(() => {
        stopWatchers.forEach((stop) => stop())
        ctx.dispose()
      })

      return { ctx }
    },

    render() {
      if (!block.rootNode) return null
      // 如果没有 loader，创建一个空壳渲染（仅渲染 HTML 原生元素）
      if (!loader) {
        console.warn('[createRenderer] No loader provided, using fallback')
        return null
      }
      return renderNode(block.rootNode, this.ctx, loader, mode)
    },
  })
}

/**
 * 判断值是否为简单类型
 */
function isSimpleType(value: unknown): boolean {
  return (
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    value === null ||
    value === undefined
  )
}
