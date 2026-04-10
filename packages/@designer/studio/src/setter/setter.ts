/**
 * Setter - 属性面板读写管理
 *
 * 桥接 Selection（选中节点）与 NodeModel（属性数据），
 * 对外提供属性面板所需的读/写 API。
 *
 * 读取流程：Selection → nodeId → BlockModel.findNode() → MaterialStore.getMeta() → 合并 schema + 实际值
 * 写入流程：用户修改字段 → node.setProp() → NodePropsChanged 事件 → Simulator 增量更新
 *
 * @example
 * ```ts
 * const setter = new Setter(engine)
 * const fields = setter.getFields()   // 获取属性面板字段列表
 * setter.setProp('type', 'primary')   // 设置属性值
 * ```
 */
import type { Engine } from '../engine/engine'
import type { PropMeta, EventMeta, SlotMeta } from '@sunny-base-web/designer-materials'

/** 属性面板字段（合并了 ComponentMeta 的 schema 和节点的实际值） */
export interface SetterField {
  /** 属性名 */
  name: string
  /** 显示标题 */
  title: string
  /** 值类型 */
  type: PropMeta['type']
  /** 分组 */
  group?: string
  /** 当前值 */
  value: any
  /** 默认值 */
  defaultValue?: any
  /** 说明 */
  description?: string
  /** 是否必填 */
  required?: boolean
  /** select 类型的选项 */
  options?: { label: string; value: any }[]
  /** 排序权重 */
  order?: number
}

export class Setter {
  /** Engine 引用 */
  private readonly engine: Engine

  constructor(engine: Engine) {
    this.engine = engine
  }

  // ── 读取 ──────────────────────────────────────────────

  /**
   * 获取当前选中节点的属性面板字段列表
   *
   * 合并 ComponentMeta 的属性 schema 与节点的实际 props 值。
   * 没有选中节点时返回空数组。
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
   */
  getEvents(): EventMeta[] {
    const node = this.engine.getSelected()
    if (!node) return []

    const meta = this.engine.materialStore.getMeta(node.name)
    return meta?.events ?? []
  }

  /**
   * 获取当前选中节点的插槽列表
   */
  getSlots(): SlotMeta[] {
    const node = this.engine.getSelected()
    if (!node) return []

    const meta = this.engine.materialStore.getMeta(node.name)
    return meta?.slots ?? []
  }

  /**
   * 获取当前选中节点的 ComponentMeta
   */
  getSelectedNodeMeta() {
    const node = this.engine.getSelected()
    if (!node) return null
    return this.engine.materialStore.getMeta(node.name)
  }

  /**
   * 获取当前选中节点的名称
   */
  getSelectedNodeName(): string | null {
    return this.engine.getSelected()?.name ?? null
  }

  // ── 写入 ──────────────────────────────────────────────

  /**
   * 设置属性值
   *
   * 直接委托给 NodeModel.setProp()，触发 NodePropsChanged 事件。
   */
  setProp(name: string, value: any): void {
    const node = this.engine.getSelected()
    if (!node) return
    node.setProp(name, value)
  }

  /**
   * 设置事件处理函数
   */
  setEvent(name: string, handler: string): void {
    const node = this.engine.getSelected()
    if (!node) return
    node.setEvent(name, handler)
  }

  /**
   * 添加指令
   */
  addDirective(directive: { name: string; value: string; arg?: string; modifiers?: string[] }): void {
    const node = this.engine.getSelected()
    if (!node) return
    node.addDirective(directive)
  }

  /**
   * 移除指令
   */
  removeDirective(name: string): void {
    const node = this.engine.getSelected()
    if (!node) return
    node.removeDirective(name)
  }
}
