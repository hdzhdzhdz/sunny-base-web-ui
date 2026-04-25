/**
 * Setter - 属性面板读写管理
 *
 * 桥接 Engine（选中节点）与 NodeModel（属性数据），
 * 对外提供属性面板所需的读/写 API。
 *
 * ## 读取流程
 *
 * ```
 * Setter.getFields()
 *   → Engine.getSelected() → NodeModel
 *   → MaterialStore.getMeta(node.name) → ComponentMeta
 *   → 合并 ComponentMeta.props (schema) + node.props (实际值)
 *   → 返回 SetterField[]
 * ```
 *
 * ## 写入流程
 *
 * ```
 * 用户修改字段 → Setter.setProp(name, value)
 *   → NodeModel.setProp(name, value)
 *   → emitter.emit(EVENT_NODE_CHANGE, { action: 'props' })
 *   → Workspace 监听 → Simulator.renderNodeUpdate()
 * ```
 *
 * ## SetterField 合并逻辑
 *
 * ```
 * ComponentMeta.props[i]:  { name: 'type', title: '类型', type: 'select', defaultValue: 'primary', options: [...] }
 * NodeModel.props:         { type: 'danger' }
 * 合并结果 SetterField:     { name: 'type', title: '类型', type: 'select', value: 'danger', defaultValue: 'primary', options: [...] }
 * ```
 *
 * @example
 * ```ts
 * const setter = new Setter(engine)
 *
 * // 读取
 * const fields = setter.getFields()        // 属性面板字段列表
 * const events = setter.getEvents()        // 事件列表
 * const slots = setter.getSlots()          // 插槽列表
 * const name = setter.getSelectedNodeName() // 选中节点名称
 *
 * // 写入
 * setter.setProp('type', 'primary')  // 设置属性值
 * setter.setEvent('click', 'handle') // 设置事件绑定
 * ```
 */
import type { Engine } from '../engine/engine'
import type { PropMeta, EventMeta, SlotMeta } from '@sunny-base-web/designer-materials'

/**
 * 属性面板字段
 *
 * 合并了 ComponentMeta 的属性 schema 与节点的实际 props 值。
 * UI 层根据 type 字段决定渲染哪种输入组件。
 */
export interface SetterField {
  /** 属性名（对应 NodeModel.props 的 key） */
  name: string
  /** 显示标题（来自 ComponentMeta.props.title） */
  title: string
  /** 值类型（决定 UI 渲染的输入组件类型） */
  type: PropMeta['type']
  /** 分组（属性在面板中的分类） */
  group?: string
  /** 当前值（优先取节点实际值，fallback 到 defaultValue） */
  value: any
  /** 默认值（来自 ComponentMeta.props.defaultValue） */
  defaultValue?: any
  /** 属性说明 */
  description?: string
  /** 是否必填 */
  required?: boolean
  /** select 类型的选项列表 */
  options?: { label: string; value: any }[]
  /** 排序权重 */
  order?: number
}

export class Setter {
  /** Engine 引用（提供选中节点和物料查询） */
  private readonly engine: Engine

  /**
   * 创建 Setter 实例
   *
   * @param engine - Engine 实例
   */
  constructor(engine: Engine) {
    this.engine = engine
  }

  // ── 读取 ──────────────────────────────────────────────

  /**
   * 获取当前选中节点的属性面板字段列表
   *
   * 合并 ComponentMeta 的属性 schema 与节点的实际 props 值。
   * 没有选中节点或找不到 ComponentMeta 时返回空数组。
   *
   * @returns SetterField 数组
   */
  getFields(): SetterField[] {
    const node = this.engine.getSelected()
    if (!node) return []

    const meta = this.engine.materialStore.getMeta(node.name)
    if (!meta) return []

    return meta.props.map((propMeta: PropMeta): SetterField => ({
      name: propMeta.name,
      title: propMeta.title,
      type: propMeta.type,
      group: propMeta.group,
      value: node.props[propMeta.name] ?? propMeta.defaultValue,
      defaultValue: propMeta.defaultValue,
      description: propMeta.description,
      required: propMeta.required,
      options: propMeta.options,
      order: propMeta.order,
    }))
  }

  /**
   * 获取当前选中节点的事件列表
   *
   * 来自 ComponentMeta.events，定义组件支持哪些事件。
   *
   * @returns EventMeta 数组
   */
  getEvents(): EventMeta[] {
    const node = this.engine.getSelected()
    if (!node) return []

    const meta = this.engine.materialStore.getMeta(node.name)
    return meta?.events ?? []
  }

  /**
   * 获取当前选中节点的插槽列表
   *
   * 来自 ComponentMeta.slots，定义组件支持哪些插槽。
   *
   * @returns SlotMeta 数组
   */
  getSlots(): SlotMeta[] {
    const node = this.engine.getSelected()
    if (!node) return []

    const meta = this.engine.materialStore.getMeta(node.name)
    return meta?.slots ?? []
  }

  /**
   * 获取当前选中节点的 ComponentMeta
   *
   * @returns ComponentMeta，未选中时返回 null
   */
  getSelectedNodeMeta() {
    const node = this.engine.getSelected()
    if (!node) return null
    return this.engine.materialStore.getMeta(node.name)
  }

  /**
   * 获取当前选中节点的组件名称
   *
   * @returns 组件名称，未选中时返回 null
   */
  getSelectedNodeName(): string | null {
    return this.engine.getSelected()?.name ?? null
  }

  // ── 写入 ──────────────────────────────────────────────

  /**
   * 设置属性值
   *
   * 直接委托给 NodeModel.setProp()，触发 EVENT_NODE_CHANGE。
   *
   * @param name - 属性名
   * @param value - 属性值
   */
  setProp(name: string, value: any): void {
    const node = this.engine.getSelected()
    if (!node) return
    node.setProp(name, value)
  }

  /**
   * 设置事件处理函数
   *
   * 委托给 NodeModel.setEvent()，触发 EVENT_NODE_CHANGE。
   *
   * @param name - 事件名
   * @param handler - 处理函数名称或表达式
   */
  setEvent(name: string, handler: string): void {
    const node = this.engine.getSelected()
    if (!node) return
    node.setEvent(name, handler)
  }

  /**
   * 添加指令
   *
   * 委托给 NodeModel.addDirective()，触发 EVENT_NODE_CHANGE。
   *
   * @param directive - 指令绑定对象
   */
  addDirective(directive: { name: string; value: string; arg?: string; modifiers?: string[] }): void {
    const node = this.engine.getSelected()
    if (!node) return
    node.addDirective(directive)
  }

  /**
   * 移除指令
   *
   * 委托给 NodeModel.removeDirective()，触发 EVENT_NODE_CHANGE。
   *
   * @param name - 指令名
   */
  removeDirective(name: string): void {
    const node = this.engine.getSelected()
    if (!node) return
    node.removeDirective(name)
  }
}
