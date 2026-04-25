/**
 * BlockModel - 页面/区块模型
 *
 * 对应低代码设计器中的「页面/组件」层，是 ProjectModel 的核心子单元。
 * 每个 BlockModel 代表一个独立的页面或可复用组件。
 *
 * ## 核心职责
 *
 * BlockModel 包含四大类数据：
 *
 * 1. **节点树**（rootNode）— 页面的 UI 结构，树形 NodeModel
 * 2. **JS 声明**（state / computed / methods / watch）— 页面的逻辑代码
 * 3. **CSS 样式**（css）— 页面的样式块列表
 * 4. **Vue 编译宏**（props / emits / expose / slots / lifecycleHooks / inject）— SFC 宏定义
 *
 * ## 事件通信
 *
 * 节点树变更（增删移动）由 NodeModel 内部广播 `EVENT_NODE_CHANGE`。
 * Block 级别变更（JS 声明、CSS、编译宏）由本类广播 `EVENT_BLOCK_CHANGE`。
 *
 * ## 数据结构
 *
 * ```
 * BlockModel (首页)
 *   ├── name: '首页'
 *   ├── route: '/'
 *   ├── rootNode: NodeModel (div)           ← 节点树
 *   │     ├── children: [NodeModel, ...]
 *   │     └── ...
 *   ├── state: [{ name: 'count', value: '0' }]    ← JS 声明
 *   ├── computed: [{ name: 'doubleCount', ... }]
 *   ├── methods: [{ name: 'increment', ... }]
 *   ├── watch: [{ name: 'count', ... }]
 *   ├── css: [{ id: 'xxx', selector: '.page', properties: {...} }]
 *   ├── props: [{ name: 'title', type: 'String' }]  ← 编译宏
 *   ├── emits: [{ name: 'change' }]
 *   ├── expose: [{ name: 'getData' }]
 *   ├── slots: [{ name: 'default' }]
 *   ├── lifecycleHooks: [{ name: 'onMounted', value: '...' }]
 *   └── inject: [{ name: 'config' }]
 * ```
 *
 * @example
 * ```ts
 * const block = new BlockModel('首页', { route: '/home' })
 *
 * // 设置根节点
 * block.setRootNode(new NodeModel('div', { isContainer: true }))
 *
 * // 添加子节点
 * block.addNode(block.rootNode!.id, new NodeModel('SunnyButton'))
 *
 * // 添加 JS 声明
 * block.addState({ name: 'count', value: '0' })
 * block.addMethod({ name: 'increment', value: 'count.value++' })
 *
 * // 序列化 / 反序列化
 * const json = block.toJSON()
 * const restored = BlockModel.fromJSON(json)
 * ```
 */
import { nanoid } from 'nanoid'
import { emitter, EVENT_BLOCK_CHANGE } from '../emitter'
import type { BlockChangeAction } from '../emitter'
import { NodeModel } from './node-model'
import type {
  JsDeclaration,
  CssBlock,
  PropDefinition,
  EmitDefinition,
  ExposeDefinition,
  SlotDefinition,
  LifecycleHook,
  InjectDeclaration,
  DropPosition,
  BlockModelJSON,
} from './types'

export class BlockModel {
  /** Block 唯一标识（自动生成，可通过 options.id 指定用于反序列化） */
  readonly id: string

  /**
   * 页面/组件名称
   *
   * 在 ProjectModel 的 pages 列表中作为显示名称。
   * 代码生成时作为 Vue 组件的 name 属性。
   */
  name: string

  /**
   * 页面路由路径
   *
   * 仅对「页面」类型有意义，用于 URL 映射。
   * 如 '/'、'/dashboard'、'/settings'。
   * 对「组件」类型通常为 '/'（不使用）。
   */
  route: string

  /**
   * 根节点
   *
   * 页面组件树的入口，通常是一个容器节点（如 div、SunnyLayout）。
   * 初始为 null，需要通过 setRootNode() 设置。
   */
  rootNode: NodeModel | null

  /**
   * 响应式状态声明列表
   *
   * 对应 Vue `<script setup>` 中的 `ref()` / `reactive()`。
   */
  state: JsDeclaration[]

  /**
   * 计算属性声明列表
   *
   * 对应 Vue `<script setup>` 中的 `computed()`。
   */
  computed: JsDeclaration[]

  /**
   * 方法声明列表
   *
   * 对应 Vue `<script setup>` 中的普通函数。
   */
  methods: JsDeclaration[]

  /**
   * 侦听器声明列表
   *
   * 对应 Vue `<script setup>` 中的 `watch()`。
   */
  watch: JsDeclaration[]

  /**
   * CSS 样式块列表
   *
   * 每个块包含 selector（选择器）和 properties（属性键值对）。
   * 代码生成时合并到 `<style scoped>` 中。
   */
  css: CssBlock[]

  /**
   * 组件 props 定义列表
   *
   * 对应 `defineProps()` 宏。
   */
  props: PropDefinition[]

  /**
   * 组件 emits 定义列表
   *
   * 对应 `defineEmits()` 宏。
   */
  emits: EmitDefinition[]

  /**
   * 组件 expose 定义列表
   *
   * 对应 `defineExpose()` 宏。
   */
  expose: ExposeDefinition[]

  /**
   * 组件插槽定义列表
   *
   * 对应 `defineSlots()` 宏。
   */
  slots: SlotDefinition[]

  /**
   * 生命周期钩子列表
   *
   * 对应 `onMounted()` / `onUnmounted()` 等生命周期 API。
   */
  lifecycleHooks: LifecycleHook[]

  /**
   * 依赖注入声明列表
   *
   * 对应 `inject()` API。
   */
  inject: InjectDeclaration[]

  /**
   * 创建 BlockModel 实例
   *
   * @param name - 页面/组件名称
   * @param options - 可选配置
   * @param options.id - 指定 ID（用于反序列化），默认自动生成
   * @param options.route - 页面路由，默认 '/'
   */
  constructor(
    name: string,
    options?: {
      id?: string
      route?: string
    },
  ) {
    this.id = options?.id ?? nanoid()
    this.name = name
    this.route = options?.route ?? '/'
    this.rootNode = null
    this.state = []
    this.computed = []
    this.methods = []
    this.watch = []
    this.css = []
    this.props = []
    this.emits = []
    this.expose = []
    this.slots = []
    this.lifecycleHooks = []
    this.inject = []
  }

  // ── 页面基础信息 ────────────────────────────────────

  /**
   * 修改页面名称
   *
   * 广播 EVENT_BLOCK_CHANGE { action: 'update' }
   */
  setName(name: string): void {
    this.name = name
    this._emitBlockChange('update')
  }

  /**
   * 修改页面路由
   *
   * 广播 EVENT_BLOCK_CHANGE { action: 'update' }
   */
  setRoute(route: string): void {
    this.route = route
    this._emitBlockChange('update')
  }

  // ── 节点树操作 ─────────────────────────────────────

  /**
   * 设置根节点
   *
   * 将 node.parentId 设为 null，并广播变更事件。
   */
  setRootNode(node: NodeModel): void {
    node.parentId = null
    this.rootNode = node
    this._emitBlockChange('update')
  }

  /**
   * 在节点树中查找指定 ID 的节点
   *
   * 深度优先递归搜索整个组件树。
   *
   * @param nodeId - 目标节点 ID
   * @returns 找到的 NodeModel，不存在时返回 null
   */
  findNode(nodeId: string): NodeModel | null {
    if (!this.rootNode) return null
    return this._findNodeRecursive(this.rootNode, nodeId)
  }

  /** 深度优先递归查找节点 */
  private _findNodeRecursive(node: NodeModel, nodeId: string): NodeModel | null {
    if (node.id === nodeId) return node
    for (const child of node.children) {
      const found = this._findNodeRecursive(child, nodeId)
      if (found) return found
    }
    return null
  }

  /**
   * 查找指定节点的父节点
   *
   * @param nodeId - 目标节点 ID
   * @returns 父节点 NodeModel，不存在时返回 null（可能是根节点）
   */
  findParent(nodeId: string): NodeModel | null {
    if (!this.rootNode) return null
    return this._findParentRecursive(this.rootNode, nodeId)
  }

  /** 递归查找父节点 */
  private _findParentRecursive(node: NodeModel, nodeId: string): NodeModel | null {
    for (const child of node.children) {
      if (child.id === nodeId) return node
      const found = this._findParentRecursive(child, nodeId)
      if (found) return found
    }
    return null
  }

  /**
   * 在指定父节点下添加子节点
   *
   * 如果 parentId 是 rootNode 的 ID，直接调用 rootNode.addChild。
   * 广播由 NodeModel.addChild 触发 EVENT_NODE_CHANGE。
   *
   * @param parentId - 父节点 ID
   * @param node - 要添加的节点
   * @param index - 插入位置，默认追加到末尾
   */
  addNode(parentId: string, node: NodeModel, index?: number): void {
    if (parentId === this.rootNode?.id) {
      this.rootNode.addChild(node, index)
      return
    }
    const parent = this.findNode(parentId)
    if (parent) {
      parent.addChild(node, index)
    }
  }

  /**
   * 从节点树中移除指定节点
   *
   * @param nodeId - 要移除的节点 ID
   * @returns 被移除的 NodeModel，不存在时返回 null
   */
  removeNode(nodeId: string): NodeModel | null {
    if (!this.rootNode) return null
    const parent = this.findParent(nodeId)
    if (parent) {
      return parent.removeChild(nodeId)
    }
    return null
  }

  /**
   * 将节点从一个父节点移动到另一个父节点
   *
   * 先从原父节点移除，再添加到目标父节点。
   * 广播由 NodeModel 的 removeChild 和 addChild 触发。
   *
   * @param nodeId - 要移动的节点 ID
   * @param targetParentId - 目标父节点 ID
   * @param index - 插入位置，默认追加到末尾
   */
  moveNode(nodeId: string, targetParentId: string, index?: number): void {
    const node = this.findNode(nodeId)
    if (!node) return

    const sourceParent = this.findParent(nodeId)
    if (sourceParent) {
      sourceParent.removeChild(nodeId)
    }

    const targetParent = this.findNode(targetParentId)
    if (targetParent) {
      targetParent.addChild(node, index)
    }
  }

  // ── 拖拽投放 ───────────────────────────────────────

  /**
   * 判断是否可以将源节点拖放到目标节点的指定位置
   *
   * 规则：
   * - 不能拖放到自身
   * - 源和目标节点必须都存在
   * - position=inside 时，目标必须是容器
   * - position=inside 时，不能将祖先拖入自己的后代（防止循环）
   * - position=before/after 时，不能拖到根节点前后
   *
   * @param sourceNodeId - 被拖拽的节点 ID
   * @param targetNodeId - 目标节点 ID
   * @param position - 投放位置（before/after/inside）
   * @returns 是否允许投放
   */
  canDrop(sourceNodeId: string, targetNodeId: string, position: DropPosition): boolean {
    if (sourceNodeId === targetNodeId) return false
    const sourceNode = this.findNode(sourceNodeId)
    const targetNode = this.findNode(targetNodeId)
    if (!sourceNode || !targetNode) return false
    if (position === 'inside' && !targetNode.isContainer) return false
    if (position === 'inside' && this._isDescendant(sourceNodeId, targetNodeId)) return false
    if ((position === 'before' || position === 'after') && this.rootNode?.id === targetNodeId) return false
    return true
  }

  /**
   * 执行拖拽投放操作
   *
   * 先通过 canDrop 校验，校验不通过则静默返回。
   * 从原父节点移除源节点，插入到目标位置。
   *
   * @param sourceNodeId - 被拖拽的节点 ID
   * @param targetNodeId - 目标节点 ID
   * @param position - 投放位置
   */
  dropTo(sourceNodeId: string, targetNodeId: string, position: DropPosition): void {
    if (!this.canDrop(sourceNodeId, targetNodeId, position)) return
    const sourceNode = this.findNode(sourceNodeId)
    const targetNode = this.findNode(targetNodeId)
    if (!sourceNode || !targetNode) return

    const sourceParent = this.findParent(sourceNodeId)
    if (sourceParent) {
      sourceParent.removeChild(sourceNodeId)
    }

    if (position === 'inside') {
      targetNode.addChild(sourceNode)
    } else {
      const targetParent = this.findParent(targetNodeId)
      if (targetParent) {
        const targetIndex = targetParent.children.findIndex((c) => c.id === targetNodeId)
        const insertIndex = position === 'before' ? targetIndex : targetIndex + 1
        targetParent.addChild(sourceNode, insertIndex)
      }
    }
  }

  /**
   * 检查 targetNodeId 是否是 sourceNodeId 的后代节点
   *
   * 用于防止将父节点拖入子节点导致循环引用。
   */
  private _isDescendant(sourceNodeId: string, targetNodeId: string): boolean {
    const sourceNode = this.findNode(sourceNodeId)
    if (!sourceNode) return false
    return this._checkDescendantRecursive(sourceNode, targetNodeId)
  }

  /** 递归检查 targetId 是否在 node 的后代中 */
  private _checkDescendantRecursive(node: NodeModel, targetId: string): boolean {
    for (const child of node.children) {
      if (child.id === targetId) return true
      if (this._checkDescendantRecursive(child, targetId)) return true
    }
    return false
  }

  // ── JS 声明操作 ────────────────────────────────────

  /**
   * 添加响应式状态声明
   *
   * 自动设置 decl.type = 'state'。
   * 广播 EVENT_BLOCK_CHANGE { action: 'state' }
   */
  addState(decl: JsDeclaration): void {
    decl.type = 'state'
    this.state.push(decl)
    this._emitBlockChange('state')
  }

  /**
   * 移除响应式状态声明
   *
   * @param name - 状态变量名
   */
  removeState(name: string): void {
    const idx = this.state.findIndex((s) => s.name === name)
    if (idx > -1) {
      this.state.splice(idx, 1)
      this._emitBlockChange('state')
    }
  }

  /**
   * 更新响应式状态的表达式值
   *
   * @param name - 状态变量名
   * @param value - 新的表达式字符串
   */
  updateState(name: string, value: string): void {
    const decl = this.state.find((s) => s.name === name)
    if (decl) {
      decl.value = value
      this._emitBlockChange('state')
    }
  }

  /**
   * 添加计算属性声明
   *
   * 自动设置 decl.type = 'computed'。
   * 广播 EVENT_BLOCK_CHANGE { action: 'computed' }
   */
  addComputed(decl: JsDeclaration): void {
    decl.type = 'computed'
    this.computed.push(decl)
    this._emitBlockChange('computed')
  }

  /**
   * 移除计算属性声明
   *
   * @param name - 计算属性名
   */
  removeComputed(name: string): void {
    const idx = this.computed.findIndex((c) => c.name === name)
    if (idx > -1) {
      this.computed.splice(idx, 1)
      this._emitBlockChange('computed')
    }
  }

  /**
   * 添加方法声明
   *
   * 自动设置 decl.type = 'method'。
   * 广播 EVENT_BLOCK_CHANGE { action: 'method' }
   */
  addMethod(decl: JsDeclaration): void {
    decl.type = 'method'
    this.methods.push(decl)
    this._emitBlockChange('method')
  }

  /**
   * 移除方法声明
   *
   * @param name - 方法名
   */
  removeMethod(name: string): void {
    const idx = this.methods.findIndex((m) => m.name === name)
    if (idx > -1) {
      this.methods.splice(idx, 1)
      this._emitBlockChange('method')
    }
  }

  /**
   * 添加侦听器声明
   *
   * 自动设置 decl.type = 'watch'。
   * 广播 EVENT_BLOCK_CHANGE { action: 'watch' }
   */
  addWatch(decl: JsDeclaration): void {
    decl.type = 'watch'
    this.watch.push(decl)
    this._emitBlockChange('watch')
  }

  /**
   * 移除侦听器声明
   *
   * @param name - 侦听器名
   */
  removeWatch(name: string): void {
    const idx = this.watch.findIndex((w) => w.name === name)
    if (idx > -1) {
      this.watch.splice(idx, 1)
      this._emitBlockChange('watch')
    }
  }

  // ── CSS 样式操作 ───────────────────────────────────

  /**
   * 添加 CSS 样式块
   *
   * 广播 EVENT_BLOCK_CHANGE { action: 'css' }
   */
  addCssBlock(block: CssBlock): void {
    this.css.push(block)
    this._emitBlockChange('css')
  }

  /**
   * 移除 CSS 样式块
   *
   * @param id - 样式块 ID
   */
  removeCssBlock(id: string): void {
    const idx = this.css.findIndex((c) => c.id === id)
    if (idx > -1) {
      this.css.splice(idx, 1)
      this._emitBlockChange('css')
    }
  }

  /**
   * 更新 CSS 样式块的属性（合并更新）
   *
   * @param id - 样式块 ID
   * @param properties - 要更新的 CSS 属性键值对
   */
  updateCssBlock(id: string, properties: Record<string, string>): void {
    const block = this.css.find((c) => c.id === id)
    if (block) {
      block.properties = { ...block.properties, ...properties }
      this._emitBlockChange('css')
    }
  }

  // ── Vue SFC 编译宏操作 ─────────────────────────────

  /** 添加 defineProps 属性定义，广播 EVENT_BLOCK_CHANGE { action: 'update' } */
  addProp(prop: PropDefinition): void {
    this.props.push(prop)
    this._emitBlockChange('update')
  }

  /** 移除 defineProps 属性定义 */
  removeProp(name: string): void {
    const idx = this.props.findIndex((p) => p.name === name)
    if (idx > -1) {
      this.props.splice(idx, 1)
      this._emitBlockChange('update')
    }
  }

  /**
   * 更新 defineProps 属性定义（部分更新）
   *
   * @param name - 属性名
   * @param updates - 要更新的字段
   */
  updateProp(name: string, updates: Partial<PropDefinition>): void {
    const prop = this.props.find((p) => p.name === name)
    if (prop) {
      Object.assign(prop, updates)
      this._emitBlockChange('update')
    }
  }

  /** 添加 defineEmits 事件定义 */
  addEmit(emit: EmitDefinition): void {
    this.emits.push(emit)
    this._emitBlockChange('update')
  }

  /** 移除 defineEmits 事件定义 */
  removeEmit(name: string): void {
    const idx = this.emits.findIndex((e) => e.name === name)
    if (idx > -1) {
      this.emits.splice(idx, 1)
      this._emitBlockChange('update')
    }
  }

  /** 更新 defineEmits 事件定义（部分更新） */
  updateEmit(name: string, updates: Partial<EmitDefinition>): void {
    const emit = this.emits.find((e) => e.name === name)
    if (emit) {
      Object.assign(emit, updates)
      this._emitBlockChange('update')
    }
  }

  /** 添加 defineExpose 暴露定义 */
  addExpose(item: ExposeDefinition): void {
    this.expose.push(item)
    this._emitBlockChange('update')
  }

  /** 移除 defineExpose 暴露定义 */
  removeExpose(name: string): void {
    const idx = this.expose.findIndex((e) => e.name === name)
    if (idx > -1) {
      this.expose.splice(idx, 1)
      this._emitBlockChange('update')
    }
  }

  /** 添加 defineSlots 插槽定义 */
  addSlot(slot: SlotDefinition): void {
    this.slots.push(slot)
    this._emitBlockChange('update')
  }

  /** 移除 defineSlots 插槽定义 */
  removeSlot(name: string): void {
    const idx = this.slots.findIndex((s) => s.name === name)
    if (idx > -1) {
      this.slots.splice(idx, 1)
      this._emitBlockChange('update')
    }
  }

  /** 更新 defineSlots 插槽定义（部分更新） */
  updateSlot(name: string, updates: Partial<SlotDefinition>): void {
    const slot = this.slots.find((s) => s.name === name)
    if (slot) {
      Object.assign(slot, updates)
      this._emitBlockChange('update')
    }
  }

  /** 添加生命周期钩子 */
  addLifecycleHook(hook: LifecycleHook): void {
    this.lifecycleHooks.push(hook)
    this._emitBlockChange('update')
  }

  /** 移除生命周期钩子 */
  removeLifecycleHook(name: string): void {
    const idx = this.lifecycleHooks.findIndex((h) => h.name === name)
    if (idx > -1) {
      this.lifecycleHooks.splice(idx, 1)
      this._emitBlockChange('update')
    }
  }

  /** 更新生命周期钩子的函数体 */
  updateLifecycleHook(name: string, value: string): void {
    const hook = this.lifecycleHooks.find((h) => h.name === name)
    if (hook) {
      hook.value = value
      this._emitBlockChange('update')
    }
  }

  /** 添加 inject 依赖注入声明 */
  addInject(decl: InjectDeclaration): void {
    this.inject.push(decl)
    this._emitBlockChange('update')
  }

  /** 移除 inject 依赖注入声明 */
  removeInject(name: string): void {
    const idx = this.inject.findIndex((i) => i.name === name)
    if (idx > -1) {
      this.inject.splice(idx, 1)
      this._emitBlockChange('update')
    }
  }

  /** 更新 inject 依赖注入声明（部分更新） */
  updateInject(name: string, updates: Partial<InjectDeclaration>): void {
    const decl = this.inject.find((i) => i.name === name)
    if (decl) {
      Object.assign(decl, updates)
      this._emitBlockChange('update')
    }
  }

  // ── 序列化 ─────────────────────────────────────────

  /**
   * 序列化为 JSON 对象
   *
   * 递归序列化根节点，浅拷贝所有声明数组。
   * 用于持久化存储、History 快照、跨进程传输。
   *
   * @returns 可 JSON.stringify 的 BlockModelJSON 对象
   */
  toJSON(): BlockModelJSON {
    return {
      id: this.id,
      name: this.name,
      route: this.route,
      rootNode: this.rootNode?.toJSON() ?? null,
      state: [...this.state],
      computed: [...this.computed],
      methods: [...this.methods],
      watch: [...this.watch],
      css: this.css.map((c) => ({ ...c })),
      props: [...this.props],
      emits: [...this.emits],
      expose: [...this.expose],
      slots: [...this.slots],
      lifecycleHooks: [...this.lifecycleHooks],
      inject: [...this.inject],
    }
  }

  /**
   * 从 JSON 对象反序列化为 BlockModel 实例
   *
   * 递归还原根节点树，浅拷贝所有声明数组。
   *
   * @param json - 序列化的 BlockModelJSON 对象
   * @returns 还原的 BlockModel 实例
   */
  static fromJSON(json: BlockModelJSON): BlockModel {
    const block = new BlockModel(json.name, {
      id: json.id,
      route: json.route,
    })
    if (json.rootNode) {
      block.rootNode = NodeModel.fromJSON(json.rootNode)
    }
    block.state = [...json.state]
    block.computed = [...json.computed]
    block.methods = [...json.methods]
    block.watch = [...json.watch]
    block.css = [...json.css]
    block.props = [...json.props]
    block.emits = [...json.emits]
    block.expose = [...json.expose]
    block.slots = [...json.slots]
    block.lifecycleHooks = [...json.lifecycleHooks]
    block.inject = [...json.inject]
    return block
  }

  // ── 内部 ────────────────────────────────────────────

  /**
   * 广播 Block 变更事件
   *
   * @param action - 变更动作类型
   */
  private _emitBlockChange(action: BlockChangeAction): void {
    emitter.emit(EVENT_BLOCK_CHANGE, { blockId: this.id, action })
  }
}
