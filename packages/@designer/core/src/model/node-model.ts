/**
 * NodeModel - UI 节点模型
 *
 * 组件树中的最小单元，对应 Vue 模板中的一个组件标签。
 * 多个 NodeModel 通过 children 形成树形结构，构成页面的组件树。
 *
 * ## 核心职责
 *
 * - **Props 管理**：组件属性（如 `type="primary"`、`:value="formData"`）
 * - **Events 管理**：事件绑定（如 `@click="handleClick"`）
 * - **Directives 管理**：Vue 指令（如 `v-show="visible"`、`v-for="item in list"`）
 * - **Children 管理**：默认插槽子节点的增删移
 * - **Slots 管理**：具名插槽子节点的增删移
 * - **序列化**：toJSON / fromJSON / clone 支持持久化和深拷贝
 *
 * ## 事件通信
 *
 * 所有变更操作自动通过全局 emitter 广播 `EVENT_NODE_CHANGE` 事件，
 * payload.action 区分操作类型（add/remove/move/props/events/directive）。
 * 订阅方（History、Workspace 等）无需直接引用 NodeModel 即可响应变更。
 *
 * ## 数据结构
 *
 * ```
 * NodeModel (SunnyButton)
 *   ├── props: { type: 'primary', size: 'small' }
 *   ├── events: { click: 'handleClick' }
 *   ├── directives: [{ name: 'show', value: 'visible' }]
 *   ├── children: [NodeModel, NodeModel, ...]  ← 默认插槽
 *   └── slots: {                                  ← 具名插槽
 *         header: [NodeModel],
 *         footer: [NodeModel],
 *       }
 * ```
 *
 * @example
 * ```ts
 * // 创建节点
 * const node = new NodeModel('SunnyButton', {
 *   props: { type: 'primary' },
 *   events: { click: 'handleClick' },
 * })
 *
 * // 修改属性
 * node.setProp('size', 'large')   // → 自动广播 node:change { action: 'props' }
 *
 * // 添加子节点
 * const child = new NodeModel('span')
 * node.addChild(child)            // → 自动广播 node:change { action: 'add' }
 *
 * // 序列化
 * const json = node.toJSON()
 * const restored = NodeModel.fromJSON(json)
 * const cloned = node.clone()
 * ```
 */
import { nanoid } from 'nanoid'
import { emitter, EVENT_NODE_CHANGE } from '../emitter'
import type { DirectiveBinding, NodeModelJSON } from './types'

export class NodeModel {
  /** 节点唯一标识（自动生成，可通过 options.id 指定） */
  readonly id: string

  /**
   * 组件名称
   *
   * 对应 Vue 模板中的标签名，如 `'SunnyButton'`、`'a-input'`、`'div'`。
   * 用于在 ComponentRegistry 中查找组件定义和元信息。
   */
  name: string

  /**
   * 组件属性（props）
   *
   * 键值对结构，key 为属性名，value 为属性值。
   * 值可以是静态值（字符串、数字、布尔值）或表达式字符串（运行时求值）。
   *
   * @example `{ type: 'primary', size: 'large', disabled: false }`
   */
  props: Record<string, any>

  /**
   * 事件绑定
   *
   * 键值对结构，key 为事件名，value 为处理函数名称或表达式字符串。
   *
   * @example `{ click: 'handleClick', change: 'onValueChange' }`
   */
  events: Record<string, string>

  /**
   * Vue 指令列表
   *
   * 支持常用指令如 v-show、v-if、v-for、v-model 等。
   */
  directives: DirectiveBinding[]

  /**
   * 默认插槽子节点列表
   *
   * 对应 Vue 模板中标签内部的子元素。
   * 只有 isContainer=true 的节点才应该有 children。
   */
  children: NodeModel[]

  /**
   * 具名插槽
   *
   * key 为插槽名，value 为该插槽内的子节点列表。
   *
   * @example `{ header: [NodeModel], footer: [NodeModel] }`
   */
  slots: Record<string, NodeModel[]>

  /**
   * 父节点 ID
   *
   * 根节点的 parentId 为 null。
   * 添加到 BlockModel.rootNode 时设置为 null。
   * 从父节点移除时重置为 null。
   */
  parentId: string | null

  /**
   * 是否为容器节点
   *
   * 容器节点可以接受子节点拖入（如 Layout、Card）。
   * 非容器节点拒绝子节点拖入（如 Button、Input）。
   * 拖拽投放时通过此字段判断 canDrop。
   */
  isContainer: boolean

  /**
   * 组件来源标识（可选）
   *
   * 用于渲染器区分组件查找策略：
   * - `undefined` / 普通字符串 → 从 ComponentRegistry 查找
   * - `'schema:<id>'` → 异步加载 BlockSchema 并递归渲染
   */
  from?: string

  /**
   * 创建 NodeModel 实例
   *
   * @param name - 组件名称（如 'SunnyButton'、'div'）
   * @param options - 可选配置
   * @param options.id - 指定 ID（用于反序列化），默认自动生成
   * @param options.props - 初始属性
   * @param options.events - 初始事件绑定
   * @param options.directives - 初始指令列表
   * @param options.isContainer - 是否为容器节点，默认 false
   */
  constructor(
    name: string,
    options?: {
      id?: string
      props?: Record<string, any>
      events?: Record<string, string>
      directives?: DirectiveBinding[]
      isContainer?: boolean
    },
  ) {
    this.id = options?.id ?? nanoid()
    this.name = name
    this.props = options?.props ? { ...options.props } : {}
    this.events = options?.events ? { ...options.events } : {}
    this.directives = options?.directives ? [...options.directives] : []
    this.children = []
    this.slots = {}
    this.parentId = null
    this.isContainer = options?.isContainer ?? false
  }

  // ── Props ──────────────────────────────────────────────

  /**
   * 获取单个属性值
   *
   * @param key - 属性名
   * @returns 属性值，不存在时返回 undefined
   */
  getProp(key: string): any {
    return this.props[key]
  }

  /**
   * 设置单个属性值
   *
   * 广播 EVENT_NODE_CHANGE { action: 'props' }
   *
   * @param key - 属性名
   * @param value - 属性值（任意类型）
   */
  setProp(key: string, value: any): void {
    this.props[key] = value
    emitter.emit(EVENT_NODE_CHANGE, {
      nodeId: this.id,
      action: 'props',
      parentId: this.parentId,
    })
  }

  /**
   * 批量设置属性
   *
   * 遍历传入的 props 对象，逐个调用 setProp。
   * 每次调用都会广播一个 props 事件。
   *
   * @param props - 属性键值对
   */
  setProps(props: Record<string, any>): void {
    for (const [key, value] of Object.entries(props)) {
      this.setProp(key, value)
    }
  }

  /**
   * 移除单个属性
   *
   * 广播 EVENT_NODE_CHANGE { action: 'props' }
   *
   * @param key - 要移除的属性名
   */
  removeProp(key: string): void {
    delete this.props[key]
    emitter.emit(EVENT_NODE_CHANGE, {
      nodeId: this.id,
      action: 'props',
      parentId: this.parentId,
    })
  }

  // ── Events ─────────────────────────────────────────────

  /**
   * 设置事件绑定
   *
   * 广播 EVENT_NODE_CHANGE { action: 'events' }
   *
   * @param eventName - 事件名（如 'click'、'change'）
   * @param handler - 处理函数名称或表达式字符串
   */
  setEvent(eventName: string, handler: string): void {
    this.events[eventName] = handler
    emitter.emit(EVENT_NODE_CHANGE, {
      nodeId: this.id,
      action: 'events',
      parentId: this.parentId,
    })
  }

  /**
   * 移除事件绑定
   *
   * 广播 EVENT_NODE_CHANGE { action: 'events' }
   *
   * @param eventName - 要移除的事件名
   */
  removeEvent(eventName: string): void {
    delete this.events[eventName]
    emitter.emit(EVENT_NODE_CHANGE, {
      nodeId: this.id,
      action: 'events',
      parentId: this.parentId,
    })
  }

  // ── Directives ─────────────────────────────────────────

  /**
   * 添加指令
   *
   * 广播 EVENT_NODE_CHANGE { action: 'directive' }
   *
   * @param directive - 指令绑定对象
   */
  addDirective(directive: DirectiveBinding): void {
    this.directives.push(directive)
    emitter.emit(EVENT_NODE_CHANGE, {
      nodeId: this.id,
      action: 'directive',
      parentId: this.parentId,
    })
  }

  /**
   * 移除指令
   *
   * 广播 EVENT_NODE_CHANGE { action: 'directive' }
   *
   * @param name - 指令名（如 'show'、'if'）
   */
  removeDirective(name: string): void {
    const idx = this.directives.findIndex((d) => d.name === name)
    if (idx !== -1) {
      this.directives.splice(idx, 1)
      emitter.emit(EVENT_NODE_CHANGE, {
        nodeId: this.id,
        action: 'directive',
        parentId: this.parentId,
      })
    }
  }

  /**
   * 更新指令的表达式值
   *
   * 广播 EVENT_NODE_CHANGE { action: 'directive' }
   *
   * @param name - 指令名
   * @param value - 新的表达式字符串
   */
  updateDirective(name: string, value: string): void {
    const directive = this.directives.find((d) => d.name === name)
    if (directive) {
      directive.value = value
      emitter.emit(EVENT_NODE_CHANGE, {
        nodeId: this.id,
        action: 'directive',
        parentId: this.parentId,
      })
    }
  }

  // ── Children ───────────────────────────────────────────

  /**
   * 添加子节点到默认插槽
   *
   * 自动设置 child.parentId 为当前节点 ID。
   * 广播 EVENT_NODE_CHANGE { action: 'add' }
   *
   * @param child - 要添加的子节点
   * @param index - 插入位置，默认追加到末尾
   */
  addChild(child: NodeModel, index?: number): void {
    child.parentId = this.id
    const idx = index ?? this.children.length
    this.children.splice(idx, 0, child)
    emitter.emit(EVENT_NODE_CHANGE, {
      nodeId: child.id,
      action: 'add',
      parentId: this.id,
      index: idx,
    })
  }

  /**
   * 移除子节点
   *
   * 自动将 child.parentId 重置为 null。
   * 广播 EVENT_NODE_CHANGE { action: 'remove' }
   *
   * @param childId - 要移除的子节点 ID
   * @returns 被移除的 NodeModel，不存在时返回 null
   */
  removeChild(childId: string): NodeModel | null {
    const idx = this.children.findIndex((c) => c.id === childId)
    if (idx === -1) return null
    const [removed] = this.children.splice(idx, 1)
    removed.parentId = null
    emitter.emit(EVENT_NODE_CHANGE, {
      nodeId: childId,
      action: 'remove',
      parentId: this.id,
    })
    return removed
  }

  /**
   * 移动子节点在 children 中的位置
   *
   * 广播 EVENT_NODE_CHANGE { action: 'move' }
   *
   * @param childId - 要移动的子节点 ID
   * @param toIndex - 目标位置索引
   */
  moveChild(childId: string, toIndex: number): void {
    const fromIndex = this.children.findIndex((c) => c.id === childId)
    if (fromIndex === -1) return
    const [moved] = this.children.splice(fromIndex, 1)
    this.children.splice(toIndex, 0, moved)
    emitter.emit(EVENT_NODE_CHANGE, {
      nodeId: childId,
      action: 'move',
      parentId: this.id,
    })
  }

  // ── Slots ──────────────────────────────────────────────

  /**
   * 添加子节点到具名插槽
   *
   * 如果插槽不存在，自动创建。
   * 广播 EVENT_NODE_CHANGE { action: 'add' }
   *
   * @param slotName - 插槽名（如 'header'、'footer'）
   * @param child - 要添加的子节点
   * @param index - 插入位置，默认追加到末尾
   */
  addToSlot(slotName: string, child: NodeModel, index?: number): void {
    child.parentId = this.id
    if (!this.slots[slotName]) {
      this.slots[slotName] = []
    }
    const idx = index ?? this.slots[slotName].length
    this.slots[slotName].splice(idx, 0, child)
    emitter.emit(EVENT_NODE_CHANGE, {
      nodeId: child.id,
      action: 'add',
      parentId: this.id,
      index: idx,
    })
  }

  /**
   * 从具名插槽中移除子节点
   *
   * 如果插槽变为空，自动删除该插槽键。
   * 广播 EVENT_NODE_CHANGE { action: 'remove' }
   *
   * @param slotName - 插槽名
   * @param childId - 要移除的子节点 ID
   * @returns 被移除的 NodeModel，不存在时返回 null
   */
  removeFromSlot(slotName: string, childId: string): NodeModel | null {
    const slotChildren = this.slots[slotName]
    if (!slotChildren) return null
    const idx = slotChildren.findIndex((c) => c.id === childId)
    if (idx === -1) return null
    const [removed] = slotChildren.splice(idx, 1)
    removed.parentId = null
    if (slotChildren.length === 0) {
      delete this.slots[slotName]
    }
    emitter.emit(EVENT_NODE_CHANGE, {
      nodeId: childId,
      action: 'remove',
      parentId: this.id,
    })
    return removed
  }

  /**
   * 获取指定具名插槽的子节点列表
   *
   * @param slotName - 插槽名
   * @returns 子节点数组，插槽不存在时返回空数组
   */
  getSlotChildren(slotName: string): NodeModel[] {
    return this.slots[slotName] ?? []
  }

  // ── 序列化 ─────────────────────────────────────────────

  /**
   * 序列化为 JSON 对象
   *
   * 递归序列化所有子节点和插槽子节点。
   * 用于持久化存储、跨进程传输、History 快照等。
   *
   * @returns 可 JSON.stringify 的 NodeModelJSON 对象
   */
  toJSON(): NodeModelJSON {
    return {
      id: this.id,
      name: this.name,
      props: { ...this.props },
      events: { ...this.events },
      directives: this.directives.map((d) => ({ ...d })),
      children: this.children.map((c) => c.toJSON()),
      slots: Object.fromEntries(
        Object.entries(this.slots).map(([name, nodes]) => [name, nodes.map((n) => n.toJSON())])
      ),
      isContainer: this.isContainer,
      ...(this.from ? { from: this.from } : {}),
    }
  }

  /**
   * 从 JSON 对象反序列化为 NodeModel 实例
   *
   * 递归还原所有子节点和插槽子节点，自动设置 parentId。
   *
   * @param json - 序列化的 NodeModelJSON 对象
   * @returns 还原的 NodeModel 实例
   */
  static fromJSON(json: NodeModelJSON): NodeModel {
    const node = new NodeModel(json.name, {
      id: json.id,
      props: json.props,
      events: json.events,
      directives: json.directives,
      isContainer: json.isContainer,
    })
    if (json.from) {
      node.from = json.from
    }
    for (const childJson of json.children) {
      const child = NodeModel.fromJSON(childJson)
      node.children.push(child)
      child.parentId = node.id
    }
    for (const [slotName, slotNodes] of Object.entries(json.slots ?? {})) {
      node.slots[slotName] = slotNodes.map((childJson) => {
        const child = NodeModel.fromJSON(childJson)
        child.parentId = node.id
        return child
      })
    }
    return node
  }

  /**
   * 深拷贝当前节点
   *
   * 通过 toJSON → fromJSON 实现，生成完全独立的副本（新 ID）。
   *
   * @returns 深拷贝的 NodeModel 实例
   */
  clone(): NodeModel {
    return NodeModel.fromJSON(this.toJSON())
  }
}
