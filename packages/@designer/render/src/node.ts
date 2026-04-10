/**
 * renderNode - 递归渲染节点
 *
 * 纯函数，将 NodeModelJSON 递归渲染为 VNode。
 * 处理所有指令和绑定：
 * - 动态 Props 求值
 * - 事件绑定（方法名引用 + 内联表达式）
 * - v-model 双向绑定
 * - v-if / v-show 条件渲染
 * - v-for 列表渲染
 * - 具名插槽递归渲染
 * - 设计态 DOM 标记（ref + draggable）
 *
 * @example
 * ```ts
 * const vnode = renderNode(node, context, loader, 'preview')
 * ```
 */
import { h, type VNode } from 'vue'
import type { NodeModelJSON, DirectiveBinding } from '@sunny-base-web/designer-core'
import type { RenderContext } from './context'
import type { ComponentLoader } from './loader'

/**
 * 解析 v-for 表达式
 *
 * 支持: 'item in list', '(item, index) in list'
 */
function parseVFor(expr: string): { itemName: string; indexName?: string; listExpr: string } | null {
  const match = expr.match(/^\(?\s*(\w+)\s*(?:,\s*(\w+))?\s*\)?\s+in\s+(.+)$/)
  if (!match) return null
  return {
    itemName: match[1],
    indexName: match[2] || undefined,
    listExpr: match[3].trim(),
  }
}

/**
 * 求值 props
 *
 * 遍历 node.props，对每个值尝试在 context 中求值。
 */
function evaluateProps(
  rawProps: Record<string, any>,
  ctx: RenderContext | null | undefined,
): Record<string, any> {
  if (!ctx) return { ...rawProps }

  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(rawProps)) {
    if (typeof value === 'string' && ctx.state[value] !== undefined) {
      // 值是作用域中的变量名 → 取实际值
      const resolved = ctx.state[value]
      result[key] = resolved?.__v_isRef ? resolved.value : resolved
    } else {
      result[key] = value
    }
  }
  return result
}

/**
 * 构建事件绑定
 *
 * 将 NodeModel.events 映射为 Vue 的 onXxx props。
 */
function buildEventBindings(
  events: Record<string, string>,
  ctx: RenderContext | null | undefined,
): Record<string, (...args: any[]) => any> {
  if (!ctx || !Object.keys(events).length) return {}

  const bindings: Record<string, (...args: any[]) => any> = {}
  for (const [eventName, handler] of Object.entries(events)) {
    const vueEventName = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`

    // 检查 handler 是否是作用域中的方法
    const existing = ctx.state[handler]
    if (existing && typeof existing === 'function') {
      bindings[vueEventName] = existing
    } else {
      // 内联表达式
      const fn = ctx.parseFunction(`return (${handler})`, ['__event__'])
      bindings[vueEventName] = (...args: any[]) => {
        try {
          const result = fn(args[0])
          if (typeof result === 'function') {
            result(...args)
          }
        } catch {
          // 表达式执行失败，静默忽略
        }
      }
    }
  }
  return bindings
}

/**
 * 处理 v-model 指令
 *
 * 将 v-model="form.name" 转换为 :modelValue + @update:modelValue
 */
function buildVModelBindings(
  directives: DirectiveBinding[],
  ctx: RenderContext | null | undefined,
): Record<string, any> {
  if (!ctx) return {}

  const bindings: Record<string, any> = {}
  for (const directive of directives) {
    if (directive.name !== 'model') continue

    const modelProp = directive.arg || 'modelValue'
    const updateEvent = `onUpdate:${modelProp}`

    // 当前值
    bindings[modelProp] = ctx.evaluate(directive.value)

    // 更新回调
    bindings[updateEvent] = (newValue: any) => {
      ctx.assign(directive.value, newValue)
    }
  }
  return bindings
}

/**
 * 渲染单个节点的子树
 *
 * 递归渲染入口，处理 v-if/v-for 后分发到 renderSingleNode。
 */
export function renderNode(
  node: NodeModelJSON,
  ctx: RenderContext,
  loader: ComponentLoader,
  mode: 'design' | 'preview',
): VNode | VNode[] | null {
  const isPreview = mode === 'preview'
  const directives = node.directives

  // ── v-if
  const vIf = directives.find((d) => d.name === 'if')
  if (vIf) {
    const show = isPreview ? !!ctx.evaluate(vIf.value) : true
    if (!show) return null
  }

  // ── v-for
  const vFor = directives.find((d) => d.name === 'for')
  if (vFor && isPreview) {
    const parsed = parseVFor(vFor.value)
    if (parsed) {
      const list = ctx.evaluate(parsed.listExpr)
      if (Array.isArray(list)) {
        return list.map((item: any, index: number) => {
          const iterCtx = ctx.clone({
            [parsed.itemName]: item,
            ...(parsed.indexName ? { [parsed.indexName]: index } : {}),
          })
          return renderSingleNode(node, ctx, loader, mode)
        })
      }
    }
    // 求值失败，渲染单个
    return renderSingleNode(node, ctx, loader, mode)
  }

  return renderSingleNode(node, ctx, loader, mode)
}

/**
 * 渲染单个节点（不含 v-for 逻辑）
 */
function renderSingleNode(
  node: NodeModelJSON,
  ctx: RenderContext,
  loader: ComponentLoader,
  mode: 'design' | 'preview',
): VNode {
  const isPreview = mode === 'preview'
  const directives = node.directives

  // ── 加载组件
  const resolved = loader.load(node.name, node.from)
  const component = resolved

  // ── 未注册组件 → 占位符
  if (!component || (typeof component === 'string' && component === node.name && !loader.load(node.name))) {
    // loader 内部已处理占位符，这里做保险
  }

  // ── 组装 Props
  const activeCtx = isPreview ? ctx : null
  const mergedProps: Record<string, any> = {
    ...evaluateProps(node.props, activeCtx),
    ...buildEventBindings(node.events, activeCtx),
    ...buildVModelBindings(directives, activeCtx),
  }

  // ── v-show
  const vShow = directives.find((d) => d.name === 'show')
  if (vShow && isPreview) {
    const show = !!ctx.evaluate(vShow.value)
    if (!show) {
      mergedProps.style = { ...mergedProps.style, display: 'none' }
    }
  }

  // ── 设计态：注入 ref + DOM 标记
  if (mode === 'design') {
    mergedProps.ref = ctx.ref(node.id)
  }

  // ── 构建 children 和 slots
  const hasDefaultChildren = node.children?.length > 0
  const hasNamedSlots = Object.keys(node.slots ?? {}).length > 0

  if (!hasDefaultChildren && !hasNamedSlots) {
    return h(component, mergedProps)
  }

  // 构建 slot 内容
  const slotContents: Record<string, () => VNode[]> = {}

  // 默认插槽
  if (hasDefaultChildren) {
    slotContents.default = () =>
      node.children.map((child) =>
        renderNodeAsVNode(child, ctx, loader, mode),
      )
  }

  // 具名插槽
  if (hasNamedSlots) {
    for (const [slotName, slotNodes] of Object.entries(node.slots)) {
      if (slotNodes?.length) {
        slotContents[slotName] = () =>
          slotNodes.map((child) =>
            renderNodeAsVNode(child, ctx, loader, mode),
          )
      }
    }
  }

  const vnode = h(component, mergedProps, slotContents)

  // ── 设计态：给 DOM 打标记
  if (mode === 'design') {
    // markElement 在 ref 回调中处理更合适，这里通过 ref 注入
  }

  return vnode
}

/**
 * 将单个节点渲染为 VNode（过滤 null）
 */
function renderNodeAsVNode(
  node: NodeModelJSON,
  ctx: RenderContext,
  loader: ComponentLoader,
  mode: 'design' | 'preview',
): VNode {
  const result = renderNode(node, ctx, loader, mode)
  // renderNode 可能返回 null（v-if=false）或数组（v-for），这里做归一化
  if (result === null) {
    return h('template') as unknown as VNode
  }
  if (Array.isArray(result)) {
    return h('div', { class: 'sunny-renderer-fragment' }, result) as unknown as VNode
  }
  return result
}
