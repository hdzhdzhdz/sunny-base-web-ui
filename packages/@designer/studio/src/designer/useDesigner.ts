/**
 * useDesigner - Designer 计算层
 *
 * 从 Designer 的响应式状态（hoveredNodeId / selectedNodeId）和
 * Simulator 的 DOM 查询能力，计算出 overlay 所需的 CSS 定位样式。
 *
 * ## 数据流
 *
 * ```
 * designer.hoveredNodeId  (Ref) → hoverStyle  (computed) → DesignerOverlay
 * designer.selectedNodeId (Ref) → selectStyle (computed) → DesignerOverlay
 *                                → toolbarStyle(computed) → DesignerOverlay
 * ```
 *
 * 每个 computed 内部通过 Simulator 查询 iframe 内元素位置，
 * 加上 iframe 在主窗口中的偏移，得到主窗口坐标系下的 fixed 定位值。
 *
 * @example
 * ```ts
 * const designer = new Designer({ simulator, engine, materialStore, actions })
 * designer.activate()
 * const state = useDesigner(designer)
 * // state.hoverStyle / selectStyle / toolbarStyle 响应式更新
 * ```
 */
import { computed, ref, type CSSProperties } from 'vue'
import type { Designer } from './designer'
import type { Simulator } from '../simulator/simulator'

/**
 * 计算 overlay/toolbar 所需的 CSS 定位样式
 *
 * 直接用于 Vue 的 `:style` 绑定。
 */
export type OverlayStyle = CSSProperties

/**
 * 从 Designer 实例计算 overlay 样式
 *
 * @param designer - Designer 实例（包含响应式状态和 Simulator 引用）
 */
export function useDesigner(designer: Designer) {
  const simulator = designer.simulator

  /** 手动刷新计数器（递增时触发所有 computed 重新计算） */
  const refreshCounter = ref(0)

  /** 刷新 overlay 位置（节点布局变化后手动调用） */
  function refresh() {
    refreshCounter.value++
  }

  // ── Hover overlay ──

  const hoverStyle = computed(() => {
    void refreshCounter.value
    const nodeId = designer.hoveredNodeId.value
    if (!nodeId) return null
    return computeOverlayStyle(simulator, nodeId)
  })

  // ── Select overlay ──

  const selectStyle = computed(() => {
    void refreshCounter.value
    const nodeId = designer.selectedNodeId.value
    if (!nodeId) return null
    return computeOverlayStyle(simulator, nodeId)
  })

  // ── Toolbar ──

  const toolbarStyle = computed(() => {
    void refreshCounter.value
    const nodeId = designer.selectedNodeId.value
    if (!nodeId) return null
    return computeToolbarStyle(simulator, nodeId)
  })

  // ── 选中节点名称（工具栏显示用） ──

  const selectedNodeName = computed(() => {
    const nodeId = designer.selectedNodeId.value
    if (!nodeId) return null
    const block = designer.engine.getActiveBlock()
    if (!block) return null
    const node = block.findNode(nodeId)
    return node?.name ?? null
  })

  return {
    hoverStyle,
    selectStyle,
    toolbarStyle,
    selectedNodeName,
    designer,
    refresh,
  }
}

// ── 样式计算 ──

/** 节点在主窗口坐标系下的原始矩形（数值，单位 px） */
interface NodeRect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * 获取节点在主窗口坐标系下的矩形
 *
 * iframe 内元素的 getBoundingClientRect 返回的是 iframe 内部坐标，
 * 需要加上 iframe 自身在主窗口中的偏移量才能正确定位 overlay。
 */
function getNodeRect(simulator: Simulator, nodeId: string): NodeRect | null {
  const iframeRect = simulator.getIframeRect()
  if (!iframeRect) return null

  const element = simulator.getNodeElement(nodeId)
  if (!element) return null

  const rect = element.getBoundingClientRect()

  return {
    left: iframeRect.left + rect.left,
    top: iframeRect.top + rect.top,
    width: rect.width,
    height: rect.height,
  }
}

/**
 * 计算节点高亮/选中框的 fixed 定位样式
 */
function computeOverlayStyle(simulator: Simulator, nodeId: string): OverlayStyle | null {
  const rect = getNodeRect(simulator, nodeId)
  if (!rect) return null

  return {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  }
}

/**
 * 计算操作工具栏的 fixed 定位样式
 *
 * 工具栏定位在选中节点的右上方：
 * - 右对齐节点右边
 * - 底边紧贴节点顶边
 */
function computeToolbarStyle(simulator: Simulator, nodeId: string): OverlayStyle | null {
  const rect = getNodeRect(simulator, nodeId)
  if (!rect) return null

  // 工具栏高度 28px，右对齐节点右边
  return {
    left: `${rect.left + rect.width - 100}px`,
    top: `${rect.top - 28}px`,
    width: '100px',
    height: '28px',
  }
}
