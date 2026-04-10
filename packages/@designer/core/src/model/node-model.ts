import { nanoid } from 'nanoid'
import type { IEventBus } from '../event/index'
import { DesignerEventType } from '../event/index'
import type { DirectiveBinding, NodeModelJSON } from './types'

/**
 * NodeModel - UI 节点模型
 *
 * 对应用户架构中的「UI 节点」层，代表组件树中的一个组件实例。
 * NodeModel 是组件树的最小单元，对应 Vue 模板中的一个组件标签。
 *
 * 核心职责：
 * - **props**：管理组件的属性值（如 `<Button type="primary">` 中的 `type`）
 * - **events**：管理组件的事件绑定（如 `@click="handleClick"` 中的处理函数表达式）
 * - **directives**：管理 Vue 指令（如 `v-if`, `v-for`, `v-show`, `v-model` 等）
 * - **children**：管理子节点列表，构成组件树
 * - **isContainer**：标记是否为容器组件（可接收子节点拖入）
 *
 * 所有变更操作都会通过 EventBus 发射事件，供 Engine / History / UI 层监听响应。
 * 通常不直接操作 NodeModel，而是通过 {@link BlockModel} 的节点树方法间接管理。
 *
 * @example
 * ```ts
 * // 创建一个按钮节点
 * const button = new NodeModel(eventBus, 'SunnyButton', {
 *   props: { type: 'primary', size: 'medium' },
 * })
 *
 * // 创建一个容器并添加子节点
 * const container = new NodeModel(eventBus, 'div', { isContainer: true })
 * container.addChild(button)
 *
 * // 修改属性（触发事件）
 * button.setProp('type', 'default')
 *
 * // 绑定事件（值为表达式字符串）
 * button.setEvent('click', 'handleButtonClick')
 *
 * // 添加指令
 * button.addDirective({ name: 'show', value: 'visible' })
 * ```
 */
export class NodeModel {
  /** 节点唯一标识（自动生成，可用于反序列化指定） */
  readonly id: string
  /** 组件名称（如 'SunnyButton', 'a-input', 'div'） */
  name: string
  /** 当前属性值（key 为 prop 名，value 为当前值） */
  props: Record<string, any>
  /**
   * 事件绑定映射（key 为事件名，value 为处理函数表达式字符串）
   *
   * 表达式字符串会在代码生成阶段转换为 Vue 模板中的事件绑定。
   * @example `{ click: 'handleButtonClick', change: '(val) => form.name = val' }`
   */
  events: Record<string, string>
  /** Vue 指令绑定列表（如 v-if, v-for, v-show, v-model 等） */
  directives: DirectiveBinding[]
  /** 默认插槽的子节点列表（有序） */
  children: NodeModel[]
  /**
   * 具名插槽（key 为插槽名，value 为子节点列表）
   *
   * 对应 Vue 模板中的 `<template #slotName>` 包裹的内容。
   * @example `{ header: [titleNode], footer: [btnNode] }`
   */
  slots: Record<string, NodeModel[]>
  /** 父节点 ID，根节点时为 null */
  parentId: string | null
  /**
   * 是否为容器组件（可接收子节点拖入）
   *
   * 容器组件允许通过拖拽添加子节点（如 div, SunnyForm, a-table 等），
   * 非容器组件（如 SunnyButton, a-input）不接受子节点。
   */
  isContainer: boolean

  /** 组件来源标识（可选，用于 loader 区分组件查找策略） */
  from?: string

  /** 事件总线实例，用于发射节点变更事件 */
  private readonly eventBus: IEventBus

  /**
   * 创建 NodeModel 实例
   *
   * @param eventBus - 事件总线实例，用于发射 Model 变更事件
   * @param name - 节点名称，如 'SunnyButton', 'a-input', 'div'
   * @param options - 可选配置
   * @param options.id - 指定 ID（用于反序列化），默认自动生成
   * @param options.props - 初始属性值
   * @param options.events - 初始事件绑定
   * @param options.directives - 初始指令列表
   * @param options.isContainer - 是否为容器组件，默认 false
   */
  constructor(
    eventBus: IEventBus,
    name: string,
    options?: {
      id?: string
      props?: Record<string, any>
      events?: Record<string, string>
      directives?: DirectiveBinding[]
      isContainer?: boolean
    },
  ) {
    this.eventBus = eventBus
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

  // ── Props 属性操作 ─────────────────────────────────

  /**
   * 获取指定属性值
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
   * 触发 {@link DesignerEventType.NodePropsChanged} 事件，携带 oldValue 和 newValue。
   *
   * @param key - 属性名
   * @param value - 新的属性值
   */
  setProp(key: string, value: any): void {
    const oldValue = this.props[key]
    this.props[key] = value
    this.eventBus.emit(DesignerEventType.NodePropsChanged, {
      nodeId: this.id,
      propName: key,
      oldValue,
      newValue: value,
    })
  }

  /**
   * 批量设置属性值
   *
   * 内部循环调用 {@link setProp}，每个属性变更都会触发独立事件。
   *
   * @param props - 要设置的属性键值对
   */
  setProps(props: Record<string, any>): void {
    for (const [key, value] of Object.entries(props)) {
      this.setProp(key, value)
    }
  }

  /**
   * 移除指定属性
   *
   * 触发 {@link DesignerEventType.NodePropsChanged} 事件，newValue 为 undefined。
   *
   * @param key - 要移除的属性名
   */
  removeProp(key: string): void {
    const oldValue = this.props[key]
    delete this.props[key]
    this.eventBus.emit(DesignerEventType.NodePropsChanged, {
      nodeId: this.id,
      propName: key,
      oldValue,
      newValue: undefined,
    })
  }

  // ── Events 事件绑定操作 ────────────────────────────

  /**
   * 设置事件绑定
   *
   * 将事件名映射到处理函数表达式字符串。表达式在代码生成阶段会转换为
   * Vue 模板中的事件绑定（如 `@click="handleClick"`）。
   * 触发 {@link DesignerEventType.NodeEventsChanged} 事件。
   *
   * @param eventName - 事件名（如 'click', 'change', 'input'）
   * @param handler - 处理函数表达式字符串（如 'handleClick', '(val) => form.name = val'）
   *
   * @example
   * ```ts
   * node.setEvent('click', 'handleButtonClick')
   * node.setEvent('update:modelValue', '(val) => form.name = val')
   * ```
   */
  setEvent(eventName: string, handler: string): void {
    const oldValue = this.events[eventName]
    this.events[eventName] = handler
    this.eventBus.emit(DesignerEventType.NodeEventsChanged, {
      nodeId: this.id,
      eventName,
      oldValue,
      newValue: handler,
    })
  }

  /**
   * 移除事件绑定
   *
   * 触发 {@link DesignerEventType.NodeEventsChanged} 事件。
   *
   * @param eventName - 要移除的事件名
   */
  removeEvent(eventName: string): void {
    const oldValue = this.events[eventName]
    delete this.events[eventName]
    this.eventBus.emit(DesignerEventType.NodeEventsChanged, {
      nodeId: this.id,
      eventName,
      oldValue,
      newValue: '' as string,
    })
  }

  // ── Directives 指令操作 ───────────────────────────

  /**
   * 添加 Vue 指令绑定
   *
   * 对应 Vue 模板中的 `v-if`, `v-for`, `v-show`, `v-model` 等指令。
   * 触发 {@link DesignerEventType.NodeDirectiveChanged} 事件（action: 'add'）。
   *
   * @param directive - 指令绑定对象
   *
   * @example
   * ```ts
   * // v-if 指令
   * node.addDirective({ name: 'if', value: 'visible' })
   *
   * // v-for 指令
   * node.addDirective({ name: 'for', value: 'item in list' })
   *
   * // v-show 指令
   * node.addDirective({ name: 'show', value: 'isActive' })
   * ```
   */
  addDirective(directive: DirectiveBinding): void {
    this.directives.push(directive)
    this.eventBus.emit(DesignerEventType.NodeDirectiveChanged, {
      nodeId: this.id,
      directiveName: directive.name,
      action: 'add',
    })
  }

  /**
   * 移除指定名称的指令
   *
   * 触发 {@link DesignerEventType.NodeDirectiveChanged} 事件（action: 'remove'）。
   *
   * @param name - 指令名（如 'if', 'for', 'show'）
   */
  removeDirective(name: string): void {
    const idx = this.directives.findIndex((d) => d.name === name)
    if (idx > -1) {
      this.directives.splice(idx, 1)
      this.eventBus.emit(DesignerEventType.NodeDirectiveChanged, {
        nodeId: this.id,
        directiveName: name,
        action: 'remove',
      })
    }
  }

  /**
   * 更新指定指令的表达式值
   *
   * 触发 {@link DesignerEventType.NodeDirectiveChanged} 事件（action: 'update'）。
   *
   * @param name - 指令名
   * @param value - 新的表达式字符串
   */
  updateDirective(name: string, value: string): void {
    const directive = this.directives.find((d) => d.name === name)
    if (directive) {
      directive.value = value
      this.eventBus.emit(DesignerEventType.NodeDirectiveChanged, {
        nodeId: this.id,
        directiveName: name,
        action: 'update',
      })
    }
  }

  // ── Children 子节点操作 ────────────────────────────

  /**
   * 添加子节点
   *
   * 将子节点的 parentId 设为当前节点 ID，并插入到指定位置。
   * 触发 {@link DesignerEventType.NodeAdded} 事件。
   *
   * @param child - 要添加的子节点
   * @param index - 插入位置索引，默认追加到末尾
   */
  addChild(child: NodeModel, index?: number): void {
    child.parentId = this.id
    const idx = index ?? this.children.length
    this.children.splice(idx, 0, child)
    this.eventBus.emit(DesignerEventType.NodeAdded, {
      nodeId: child.id,
      parentId: this.id,
      index: idx,
    })
  }

  /**
   * 移除指定子节点
   *
   * 将子节点从 children 中移除，并将其 parentId 置为 null。
   * 触发 {@link DesignerEventType.NodeRemoved} 事件。
   *
   * @param childId - 要移除的子节点 ID
   * @returns 被移除的 NodeModel 实例，不存在时返回 null
   */
  removeChild(childId: string): NodeModel | null {
    const idx = this.children.findIndex((c) => c.id === childId)
    if (idx === -1) return null
    const [removed] = this.children.splice(idx, 1)
    removed.parentId = null
    this.eventBus.emit(DesignerEventType.NodeRemoved, {
      nodeId: childId,
      parentId: this.id,
    })
    return removed
  }

  /**
   * 在当前节点的子节点列表内移动子节点位置（同级排序）
   *
   * 触发 {@link DesignerEventType.NodeMoved} 事件。
   * 注意：此方法仅用于同一父节点内的排序，跨父节点移动请使用 {@link BlockModel.dropTo}。
   *
   * @param childId - 要移动的子节点 ID
   * @param toIndex - 目标位置索引
   */
  moveChild(childId: string, toIndex: number): void {
    const fromIndex = this.children.findIndex((c) => c.id === childId)
    if (fromIndex === -1) return
    const [moved] = this.children.splice(fromIndex, 1)
    this.children.splice(toIndex, 0, moved)
    this.eventBus.emit(DesignerEventType.NodeMoved, {
      nodeId: childId,
      fromParent: this.id,
      toParent: this.id,
      fromIndex,
      toIndex,
    })
  }

  // ── Slots 具名插槽操作 ────────────────────────────

  /**
   * 添加子节点到指定具名插槽
   *
   * 对应 Vue 模板中的 `<template #slotName><ChildNode /></template>`。
   * 触发 {@link DesignerEventType.NodeAdded} 事件。
   *
   * @param slotName - 插槽名（如 'header', 'footer', 'default'）
   * @param child - 要添加的子节点
   * @param index - 在插槽内的插入位置，默认追加到末尾
   *
   * @example
   * ```ts
   * const title = new NodeModel(eventBus, 'span', { props: { text: '标题' } })
   * card.addToSlot('header', title)
   * ```
   */
  addToSlot(slotName: string, child: NodeModel, index?: number): void {
    child.parentId = this.id
    if (!this.slots[slotName]) {
      this.slots[slotName] = []
    }
    const idx = index ?? this.slots[slotName].length
    this.slots[slotName].splice(idx, 0, child)
    this.eventBus.emit(DesignerEventType.NodeAdded, {
      nodeId: child.id,
      parentId: this.id,
      index: idx,
    })
  }

  /**
   * 从指定具名插槽中移除子节点
   *
   * 触发 {@link DesignerEventType.NodeRemoved} 事件。
   *
   * @param slotName - 插槽名
   * @param childId - 要移除的子节点 ID
   * @returns 被移除的 NodeModel 实例，不存在时返回 null
   */
  removeFromSlot(slotName: string, childId: string): NodeModel | null {
    const slotChildren = this.slots[slotName]
    if (!slotChildren) return null
    const idx = slotChildren.findIndex((c) => c.id === childId)
    if (idx === -1) return null
    const [removed] = slotChildren.splice(idx, 1)
    removed.parentId = null
    // 插槽为空时清理
    if (slotChildren.length === 0) {
      delete this.slots[slotName]
    }
    this.eventBus.emit(DesignerEventType.NodeRemoved, {
      nodeId: childId,
      parentId: this.id,
    })
    return removed
  }

  /**
   * 获取指定插槽的所有子节点
   *
   * @param slotName - 插槽名
   * @returns 子节点列表，插槽不存在时返回空数组
   */
  getSlotChildren(slotName: string): NodeModel[] {
    return this.slots[slotName] ?? []
  }

  // ── 序列化 ─────────────────────────────────────────

  /**
   * 将 NodeModel 序列化为 JSON 对象
   *
   * 递归序列化整棵子树。用于持久化存储、项目导出、跨进程传输等场景。
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
   * 递归还原整棵子树，恢复所有父子关系（parentId）。
   *
   * @param json - 序列化的 NodeModelJSON 对象
   * @param eventBus - 事件总线实例，注入到所有创建的节点中
   * @returns 还原的 NodeModel 实例（含完整子树）
   */
  static fromJSON(json: NodeModelJSON, eventBus: IEventBus): NodeModel {
    const node = new NodeModel(eventBus, json.name, {
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
      const child = NodeModel.fromJSON(childJson, eventBus)
      node.children.push(child)
      child.parentId = node.id
    }
    for (const [slotName, slotNodes] of Object.entries(json.slots ?? {})) {
      node.slots[slotName] = slotNodes.map((childJson) => {
        const child = NodeModel.fromJSON(childJson, eventBus)
        child.parentId = node.id
        return child
      })
    }
    return node
  }

  /**
   * 深克隆当前节点（生成全新 ID）
   *
   * 克隆会递归复制整棵子树，所有节点获得新 ID，父子关系重新建立。
   * 注意：克隆后的节点与原节点无关联，共享同一个 EventBus 实例。
   *
   * @returns 克隆的新 NodeModel 实例
   */
  clone(): NodeModel {
    return NodeModel.fromJSON(this.toJSON(), this.eventBus)
  }
}
