/**
 * RenderContext - 运行时上下文
 *
 * 四个文件中最底层的模块，被 block/node/loader 三个模块共同依赖。
 * 负责管理运行时状态、执行表达式和函数、DOM 引用、设计态标记。
 *
 * 职责划分：
 * - **state**：响应式数据（由 block.ts 在 setup 中初始化）
 * - **evaluate**：求值表达式（如 'count > 5', 'form.name'）
 * - **parseFunction**：解析函数体（如 'count.value++', 'console.log(newVal)'）
 * - **assign**：赋值表达式（v-model 双向绑定用）
 * - **clone**：克隆作用域（v-for 每次迭代用）
 * - **ref**：DOM 引用绑定（设计态用）
 * - **markElement**：给 DOM 打标记（设计态选中/拖拽用）
 */
import { reactive, type ComponentInternalInstance } from 'vue'

/**
 * 解析初始值字符串为实际值
 */
function parseValue(value: string): any {
  if (value === 'undefined') return undefined
  if (value === 'null') return null
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === '') return ''
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1)
  }
  if (value.startsWith('{') || value.startsWith('[')) {
    try { return JSON.parse(value) } catch { /* fallthrough */ }
    try { return new Function(`return (${value})`)() } catch { /* fallthrough */ }
  }
  return value
}

export class RenderContext {
  /**
   * 响应式状态对象
   *
   * 所有的 state 声明都会挂载在此对象上。
   * 由 block.ts 在 setup() 中初始化，通过 provide/inject 传递给子组件。
   */
  state: Record<string, any>

  /**
   * DOM 引用存储（设计态使用）
   *
   * key 为节点 ID，value 为 DOM 元素。
   * 通过 ref() 方法绑定，设计态用于选中、拖拽、高亮等交互。
   */
  refs: Record<string, any>

  constructor() {
    this.state = reactive({})
    this.refs = {}
  }

  // ── 表达式求值 ─────────────────────────────────────

  /**
   * 求值表达式
   *
   * 在 state 上下文中执行任意表达式字符串。
   * 用于 props 求值、指令表达式（v-if/v-show）、模板插值等。
   *
   * @param expression - 表达式字符串（如 'count > 5', 'form.name'）
   * @returns 求值结果，失败返回 undefined
   */
  evaluate(expression: string): any {
    try {
      const fn = new Function('__ctx__', `with(__ctx__) { return (${expression}) }`)
      return fn(this.state)
    } catch {
      return undefined
    }
  }

  /**
   * 解析函数
   *
   * 将函数体字符串解析为可执行函数。
   * 函数体内的 this 指向 state，可以访问所有状态变量。
   *
   * @param body - 函数体字符串（如 'count.value++'）
   * @param params - 参数名列表（如 ['newVal', 'oldVal']）
   * @returns 解析后的函数，解析失败返回空函数
   */
  parseFunction(body: string, params: string[] = []): (...args: any[]) => any {
    try {
      const fn = new Function('__ctx__', ...params, `with(__ctx__) { ${body} }`)
      return (...args: any[]) => fn(this.state, ...args)
    } catch {
      console.warn(`[RenderContext] Failed to parse function: ${body}`)
      return () => {}
    }
  }

  // ── 赋值（v-model 用） ────────────────────────────

  /**
   * 赋值表达式
   *
   * 支持 dotted path 赋值，用于 v-model 双向绑定。
   *
   * @param path - 赋值目标（如 'form.name', 'count'）
   * @param value - 新值
   */
  assign(path: string, value: any): void {
    if (!path.includes('.')) {
      this.state[path] = value
      return
    }
    const parts = path.split('.')
    const lastPart = parts.pop()!
    const parentPath = parts.join('.')
    try {
      const parent = this.evaluate(parentPath)
      if (parent && typeof parent === 'object') {
        parent[lastPart] = value
      }
    } catch {
      // 赋值失败，静默忽略
    }
  }

  // ── 作用域克隆（v-for 用） ────────────────────────

  /**
   * 克隆当前上下文（用于 v-for 迭代）
   *
   * 继承父作用域的所有状态，并注入局部变量（循环变量 item/index）。
   *
   * @param locals - 要注入的局部变量
   * @returns 新的 RenderContext 实例
   */
  clone(locals?: Record<string, any>): RenderContext {
    const child = new RenderContext()
    // 共享同一个 state（reactive 对象引用）
    child.state = this.state
    if (locals) {
      for (const [key, value] of Object.entries(locals)) {
        child.state[key] = value
      }
    }
    return child
  }

  // ── DOM 引用（设计态用） ───────────────────────────

  /**
   * 创建 DOM ref 绑定函数
   *
   * 返回一个函数，Vue 会将 DOM 元素传入。
   * 设计态通过此函数获取每个节点的 DOM 元素，用于选中/高亮/拖拽。
   *
   * @param nodeId - 节点 ID
   * @returns ref 回调函数
   */
  ref(nodeId: string): (el: any) => void {
    return (el: any) => {
      if (el) {
        const domEl = el instanceof HTMLElement ? el : el.$el
        this.refs[nodeId] = domEl
        // 设计态：给 DOM 打标记（供 EventBridge 定位、Designer overlay 查询）
        this.markElement(domEl, nodeId)
      }
    }
  }

  // ── 设计态 DOM 标记 ────────────────────────────────

  /**
   * 给 DOM 元素打设计态标记
   *
   * 在设计态模式下，给每个渲染出的 DOM 元素注入：
   * - `__nodeId__` dataset：节点 ID，用于事件定位
   * - `draggable`：允许拖拽
   * - CSS class：设计态样式（可选）
   *
   * @param el - DOM 元素
   * @param nodeId - 节点 ID
   */
  markElement(el: HTMLElement, nodeId: string): void {
    if (!el) return
    el.dataset.__nodeId__ = nodeId
    el.draggable = true
  }

  /**
   * 清理所有引用
   */
  dispose(): void {
    this.refs = {}
  }
}

/**
 * 解析初始值（导出给 block.ts 使用）
 */
export { parseValue }
