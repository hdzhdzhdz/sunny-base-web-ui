import { nanoid } from 'nanoid'
import type { IEventBus } from '../event/index'
import { DesignerEventType } from '../event/index'
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

/**
 * BlockModel - 页面/区块模型
 *
 * 对应用户架构中的「页面/组件」层，每个 Block 代表一个独立的页面或可复用组件。
 * Block 是设计器中最核心的工作单元，包含：
 *
 * - **节点树**：通过 rootNode 管理整个 UI 组件树（NodeModel）
 * - **JS 能力**：state / computed / methods / watch，对应 Vue SFC 的 `<script setup>` 部分
 * - **CSS 样式**：css 样式块列表，对应 `<style>` 部分
 *
 * 所有变更操作都会通过 EventBus 发射事件，供 Engine / History / UI 层监听响应。
 *
 * @example
 * ```ts
 * const block = new BlockModel(eventBus, '用户列表页', { route: '/user/list' })
 *
 * // 设置页面根节点
 * block.setRootNode(new NodeModel(eventBus, 'div', { isContainer: true }))
 *
 * // 添加 JS 声明
 * block.addState({ name: 'loading', type: 'state', value: 'false' })
 * block.addMethod({ name: 'fetchData', type: 'method', value: 'async () => { ... }', params: [] })
 *
 * // 添加样式
 * block.addCssBlock({ id: 'xxx', selector: '.container', properties: { padding: '16px' } })
 * ```
 */
export class BlockModel {
  /** 区块唯一标识 */
  readonly id: string
  /** 区块名称（对应 Vue 组件名或页面标题） */
  name: string
  /** 路由路径（如 '/user/list'，仅页面类型使用） */
  route: string
  /** 页面根节点，所有 UI 组件挂载于此 */
  rootNode: NodeModel | null

  // ── JS 能力（对应 Vue SFC `<script setup>` 部分） ──────

  /** 响应式状态声明列表（对应 ref/reactive） */
  state: JsDeclaration[]
  /** 计算属性声明列表（对应 computed） */
  computed: JsDeclaration[]
  /** 方法声明列表（对应 function） */
  methods: JsDeclaration[]
  /** 侦听器声明列表（对应 watch） */
  watch: JsDeclaration[]
  /** CSS 样式块列表（对应 `<style scoped>` 中的样式规则） */
  css: CssBlock[]

  // ── Vue SFC 编译宏（对应 `<script setup>` 编译宏部分） ──

  /** 组件参数定义列表（对应 defineProps） */
  props: PropDefinition[]
  /** 组件事件定义列表（对应 defineEmits） */
  emits: EmitDefinition[]
  /** 暴露的公共属性列表（对应 defineExpose） */
  expose: ExposeDefinition[]
  /** 插槽定义列表（对应 defineSlots） */
  slots: SlotDefinition[]
  /** 生命周期钩子列表（对应 onMounted / onUnmounted 等） */
  lifecycleHooks: LifecycleHook[]
  /** 注入声明列表（对应 inject） */
  inject: InjectDeclaration[]

  /** 事件总线实例，用于发射变更事件 */
  private readonly eventBus: IEventBus

  /**
   * 创建 BlockModel 实例
   *
   * @param eventBus - 事件总线实例，用于发射 Model 变更事件
   * @param name - 区块名称，如 '用户列表页'
   * @param options - 可选配置
   * @param options.id - 指定 ID（用于反序列化），默认自动生成
   * @param options.route - 路由路径，默认 '/'
   */
  constructor(
    eventBus: IEventBus,
    name: string,
    options?: {
      id?: string
      route?: string
    },
  ) {
    this.eventBus = eventBus
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
   * 设置区块名称
   *
   * 触发 {@link DesignerEventType.PageUpdated} 事件。
   *
   * @param name - 新的区块名称
   */
  setName(name: string): void {
    this.name = name
    this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
  }

  /**
   * 设置路由路径
   *
   * 触发 {@link DesignerEventType.PageUpdated} 事件。
   *
   * @param route - 新的路由路径，如 '/user/list'
   */
  setRoute(route: string): void {
    this.route = route
    this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
  }

  // ── 节点树操作 ─────────────────────────────────────

  /**
   * 设置页面根节点
   *
   * 替换当前根节点（如已有节点会被丢弃），将节点的 parentId 置为 null。
   * 触发 {@link DesignerEventType.PageUpdated} 事件。
   *
   * @param node - 要设为根节点的 NodeModel 实例
   */
  setRootNode(node: NodeModel): void {
    node.parentId = null
    this.rootNode = node
    this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
  }

  /**
   * 在节点树中递归查找指定 ID 的节点
   *
   * @param nodeId - 目标节点 ID
   * @returns 找到的 NodeModel 实例，不存在时返回 null
   */
  findNode(nodeId: string): NodeModel | null {
    if (!this.rootNode) return null
    return this._findNodeRecursive(this.rootNode, nodeId)
  }

  /** 递归查找节点的内部实现 */
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
   * @returns 父节点实例，根节点或不存在的节点返回 null
   */
  findParent(nodeId: string): NodeModel | null {
    if (!this.rootNode) return null
    return this._findParentRecursive(this.rootNode, nodeId)
  }

  /** 递归查找父节点的内部实现 */
  private _findParentRecursive(node: NodeModel, nodeId: string): NodeModel | null {
    for (const child of node.children) {
      if (child.id === nodeId) return node
      const found = this._findParentRecursive(child, nodeId)
      if (found) return found
    }
    return null
  }

  /**
   * 添加节点到指定父节点下
   *
   * 内部调用 {@link NodeModel.addChild}，由 NodeModel 负责发射 {@link DesignerEventType.NodeAdded} 事件。
   *
   * @param parentId - 目标父节点 ID
   * @param node - 要添加的 NodeModel 实例
   * @param index - 插入位置索引，默认追加到末尾
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
   * 内部调用 {@link NodeModel.removeChild}，由 NodeModel 负责发射 {@link DesignerEventType.NodeRemoved} 事件。
   *
   * @param nodeId - 要移除的节点 ID
   * @returns 被移除的 NodeModel 实例，不存在时返回 null
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
   * 将节点从一个位置移动到另一个位置（可跨父节点）
   *
   * 先从原父节点移除（触发 NodeRemoved），再添加到目标父节点（触发 NodeAdded）。
   *
   * @param nodeId - 要移动的节点 ID
   * @param targetParentId - 目标父节点 ID
   * @param index - 在目标父节点中的插入位置，默认追加到末尾
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
   * 校验节点是否可以投放到指定位置
   *
   * 校验规则：
   * 1. 源节点和目标节点必须存在且不能是同一个
   * 2. `inside` 投放要求目标节点是容器（isContainer === true）
   * 3. 不能将节点拖入自身或自身的子孙节点（循环引用校验）
   *
   * @param sourceNodeId - 被拖拽的节点 ID
   * @param targetNodeId - 投放目标节点 ID
   * @param position - 投放位置类型
   * @returns true 表示可以投放
   */
  canDrop(sourceNodeId: string, targetNodeId: string, position: DropPosition): boolean {
    // 源和目标不能是同一个节点
    if (sourceNodeId === targetNodeId) return false

    const sourceNode = this.findNode(sourceNodeId)
    const targetNode = this.findNode(targetNodeId)
    if (!sourceNode || !targetNode) return false

    // inside 投放要求目标是容器
    if (position === 'inside' && !targetNode.isContainer) return false

    // 循环引用校验：不能把节点拖入自己的子孙节点
    if (position === 'inside' && this._isDescendant(sourceNodeId, targetNodeId)) {
      return false
    }

    // before/after 投放的目标是根节点时，不允许（根节点没有兄弟节点）
    if ((position === 'before' || position === 'after') && this.rootNode?.id === targetNodeId) {
      return false
    }

    return true
  }

  /**
   * 将节点投放到指定位置（拖拽操作的执行方法）
   *
   * 根据 DropPosition 计算实际的插入位置：
   * - `inside`：直接添加为目标节点的子节点（末尾）
   * - `before`：插入到目标节点前面（目标节点的父节点中）
   * - `after`：插入到目标节点后面（目标节点的父节点中）
   *
   * 内部会先调用 {@link canDrop} 校验，校验不通过时不执行任何操作。
   *
   * @param sourceNodeId - 被拖拽的节点 ID
   * @param targetNodeId - 投放目标节点 ID
   * @param position - 投放位置类型
   *
   * @example
   * ```ts
   * // 拖拽到目标节点内部（作为子节点）
   * block.dropTo('node-1', 'container-1', 'inside')
   *
   * // 拖拽到目标节点前面
   * block.dropTo('node-1', 'node-2', 'before')
   *
   * // 拖拽到目标节点后面
   * block.dropTo('node-1', 'node-2', 'after')
   * ```
   */
  dropTo(sourceNodeId: string, targetNodeId: string, position: DropPosition): void {
    if (!this.canDrop(sourceNodeId, targetNodeId, position)) return

    const sourceNode = this.findNode(sourceNodeId)
    const targetNode = this.findNode(targetNodeId)
    if (!sourceNode || !targetNode) return

    // 从原位置移除
    const sourceParent = this.findParent(sourceNodeId)
    if (sourceParent) {
      sourceParent.removeChild(sourceNodeId)
    }

    if (position === 'inside') {
      // 投放到目标节点内部（作为最后一个子节点）
      targetNode.addChild(sourceNode)
    } else {
      // before / after：插入到目标节点的同级位置
      const targetParent = this.findParent(targetNodeId)
      if (targetParent) {
        const targetIndex = targetParent.children.findIndex((c) => c.id === targetNodeId)
        const insertIndex = position === 'before' ? targetIndex : targetIndex + 1
        targetParent.addChild(sourceNode, insertIndex)
      }
    }
  }

  /**
   * 检查 targetNodeId 是否是 sourceNodeId 的子孙节点
   */
  private _isDescendant(sourceNodeId: string, targetNodeId: string): boolean {
    const sourceNode = this.findNode(sourceNodeId)
    if (!sourceNode) return false
    return this._checkDescendantRecursive(sourceNode, targetNodeId)
  }

  /** 递归检查是否为子孙节点 */
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
   * 对应 Vue SFC 中的 `const xxx = ref(...)` 或 `const xxx = reactive(...)`。
   * 触发 {@link DesignerEventType.StateChanged} 事件（action: 'add'）。
   *
   * @param decl - 状态声明，type 字段会被强制设为 'state'
   *
   * @example
   * ```ts
   * block.addState({ name: 'loading', type: 'state', value: 'false' })
   * ```
   */
  addState(decl: JsDeclaration): void {
    decl.type = 'state'
    this.state.push(decl)
    this.eventBus.emit(DesignerEventType.StateChanged, {
      blockId: this.id,
      name: decl.name,
      action: 'add',
    })
  }

  /**
   * 移除指定名称的状态声明
   *
   * 触发 {@link DesignerEventType.StateChanged} 事件（action: 'remove'）。
   *
   * @param name - 要移除的状态变量名
   */
  removeState(name: string): void {
    const idx = this.state.findIndex((s) => s.name === name)
    if (idx > -1) {
      this.state.splice(idx, 1)
      this.eventBus.emit(DesignerEventType.StateChanged, {
        blockId: this.id,
        name,
        action: 'remove',
      })
    }
  }

  /**
   * 更新指定状态声明的值
   *
   * 触发 {@link DesignerEventType.StateChanged} 事件（action: 'update'）。
   *
   * @param name - 状态变量名
   * @param value - 新的初始值表达式字符串
   */
  updateState(name: string, value: string): void {
    const decl = this.state.find((s) => s.name === name)
    if (decl) {
      decl.value = value
      this.eventBus.emit(DesignerEventType.StateChanged, {
        blockId: this.id,
        name,
        action: 'update',
      })
    }
  }

  /**
   * 添加计算属性声明
   *
   * 对应 Vue SFC 中的 `const xxx = computed(() => ...)`。
   * 触发 {@link DesignerEventType.ComputedChanged} 事件（action: 'add'）。
   *
   * @param decl - 计算属性声明，type 字段会被强制设为 'computed'
   *
   * @example
   * ```ts
   * block.addComputed({ name: 'fullName', type: 'computed', value: '() => firstName.value + " " + lastName.value' })
   * ```
   */
  addComputed(decl: JsDeclaration): void {
    decl.type = 'computed'
    this.computed.push(decl)
    this.eventBus.emit(DesignerEventType.ComputedChanged, {
      blockId: this.id,
      name: decl.name,
      action: 'add',
    })
  }

  /**
   * 移除指定名称的计算属性声明
   *
   * 触发 {@link DesignerEventType.ComputedChanged} 事件（action: 'remove'）。
   *
   * @param name - 要移除的计算属性名
   */
  removeComputed(name: string): void {
    const idx = this.computed.findIndex((c) => c.name === name)
    if (idx > -1) {
      this.computed.splice(idx, 1)
      this.eventBus.emit(DesignerEventType.ComputedChanged, {
        blockId: this.id,
        name,
        action: 'remove',
      })
    }
  }

  /**
   * 添加方法声明
   *
   * 对应 Vue SFC 中的 `function xxx() { ... }` 或 `const xxx = () => { ... }`。
   * 触发 {@link DesignerEventType.MethodChanged} 事件（action: 'add'）。
   *
   * @param decl - 方法声明，type 字段会被强制设为 'method'
   *
   * @example
   * ```ts
   * block.addMethod({
   *   name: 'handleSubmit',
   *   type: 'method',
   *   value: 'async () => { await api.submit(form) }',
   *   params: [],
   * })
   * ```
   */
  addMethod(decl: JsDeclaration): void {
    decl.type = 'method'
    this.methods.push(decl)
    this.eventBus.emit(DesignerEventType.MethodChanged, {
      blockId: this.id,
      name: decl.name,
      action: 'add',
    })
  }

  /**
   * 移除指定名称的方法声明
   *
   * 触发 {@link DesignerEventType.MethodChanged} 事件（action: 'remove'）。
   *
   * @param name - 要移除的方法名
   */
  removeMethod(name: string): void {
    const idx = this.methods.findIndex((m) => m.name === name)
    if (idx > -1) {
      this.methods.splice(idx, 1)
      this.eventBus.emit(DesignerEventType.MethodChanged, {
        blockId: this.id,
        name,
        action: 'remove',
      })
    }
  }

  /**
   * 添加侦听器声明
   *
   * 对应 Vue SFC 中的 `watch(xxx, (...))`。
   * 触发 {@link DesignerEventType.WatchChanged} 事件（action: 'add'）。
   *
   * @param decl - 侦听器声明，type 字段会被强制设为 'watch'
   *
   * @example
   * ```ts
   * block.addWatch({
   *   name: 'keyword',
   *   type: 'watch',
   *   value: '(newVal) => { fetchData(newVal) }',
   *   params: ['newVal', 'oldVal'],
   * })
   * ```
   */
  addWatch(decl: JsDeclaration): void {
    decl.type = 'watch'
    this.watch.push(decl)
    this.eventBus.emit(DesignerEventType.WatchChanged, {
      blockId: this.id,
      name: decl.name,
      action: 'add',
    })
  }

  /**
   * 移除指定名称的侦听器声明
   *
   * 触发 {@link DesignerEventType.WatchChanged} 事件（action: 'remove'）。
   *
   * @param name - 要移除的侦听器的监听源名
   */
  removeWatch(name: string): void {
    const idx = this.watch.findIndex((w) => w.name === name)
    if (idx > -1) {
      this.watch.splice(idx, 1)
      this.eventBus.emit(DesignerEventType.WatchChanged, {
        blockId: this.id,
        name,
        action: 'remove',
      })
    }
  }

  // ── CSS 样式操作 ───────────────────────────────────

  /**
   * 添加 CSS 样式块
   *
   * 对应 `<style scoped>` 中的一条 CSS 规则。
   * 触发 {@link DesignerEventType.CssChanged} 事件（action: 'add'）。
   *
   * @param block - CSS 样式块，包含 id、selector、properties
   *
   * @example
   * ```ts
   * block.addCssBlock({
   *   id: nanoid(),
   *   selector: '.container',
   *   properties: { padding: '16px', 'background-color': '#fff' },
   * })
   * ```
   */
  addCssBlock(block: CssBlock): void {
    this.css.push(block)
    this.eventBus.emit(DesignerEventType.CssChanged, {
      blockId: this.id,
      blockId_css: block.id,
      action: 'add',
    })
  }

  /**
   * 移除指定 ID 的 CSS 样式块
   *
   * 触发 {@link DesignerEventType.CssChanged} 事件（action: 'remove'）。
   *
   * @param id - 要移除的 CSS 样式块 ID
   */
  removeCssBlock(id: string): void {
    const idx = this.css.findIndex((c) => c.id === id)
    if (idx > -1) {
      this.css.splice(idx, 1)
      this.eventBus.emit(DesignerEventType.CssChanged, {
        blockId: this.id,
        blockId_css: id,
        action: 'remove',
      })
    }
  }

  /**
   * 更新指定 CSS 样式块的属性（合并更新，不覆盖未指定的属性）
   *
   * 触发 {@link DesignerEventType.CssChanged} 事件（action: 'update'）。
   *
   * @param id - 要更新的 CSS 样式块 ID
   * @param properties - 要合并的 CSS 属性键值对
   */
  updateCssBlock(id: string, properties: Record<string, string>): void {
    const block = this.css.find((c) => c.id === id)
    if (block) {
      block.properties = { ...block.properties, ...properties }
      this.eventBus.emit(DesignerEventType.CssChanged, {
        blockId: this.id,
        blockId_css: id,
        action: 'update',
      })
    }
  }

  // ── Vue SFC 编译宏操作 ─────────────────────────────

  /**
   * 添加组件参数定义（对应 defineProps）
   *
   * @param prop - 参数定义项
   *
   * @example
   * ```ts
   * block.addProp({ name: 'title', type: 'String', required: true })
   * block.addProp({ name: 'count', type: 'Number', defaultValue: '0' })
   * ```
   */
  addProp(prop: PropDefinition): void {
    this.props.push(prop)
    this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
  }

  /**
   * 移除指定名称的参数定义
   *
   * @param name - 参数名
   */
  removeProp(name: string): void {
    const idx = this.props.findIndex((p) => p.name === name)
    if (idx > -1) {
      this.props.splice(idx, 1)
      this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
    }
  }

  /**
   * 更新指定参数定义
   *
   * @param name - 参数名
   * @param updates - 要合并更新的字段
   */
  updateProp(name: string, updates: Partial<PropDefinition>): void {
    const prop = this.props.find((p) => p.name === name)
    if (prop) {
      Object.assign(prop, updates)
      this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
    }
  }

  /**
   * 添加组件事件定义（对应 defineEmits）
   *
   * @param emit - 事件定义项
   *
   * @example
   * ```ts
   * block.addEmit({ name: 'change', params: [{ name: 'value', type: 'string' }] })
   * ```
   */
  addEmit(emit: EmitDefinition): void {
    this.emits.push(emit)
    this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
  }

  /**
   * 移除指定名称的事件定义
   *
   * @param name - 事件名
   */
  removeEmit(name: string): void {
    const idx = this.emits.findIndex((e) => e.name === name)
    if (idx > -1) {
      this.emits.splice(idx, 1)
      this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
    }
  }

  /**
   * 更新指定事件定义
   *
   * @param name - 事件名
   * @param updates - 要合并更新的字段
   */
  updateEmit(name: string, updates: Partial<EmitDefinition>): void {
    const emit = this.emits.find((e) => e.name === name)
    if (emit) {
      Object.assign(emit, updates)
      this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
    }
  }

  /**
   * 添加暴露属性定义（对应 defineExpose）
   *
   * @param item - 暴露属性定义项
   *
   * @example
   * ```ts
   * block.addExpose({ name: 'resetForm', type: '() => void' })
   * ```
   */
  addExpose(item: ExposeDefinition): void {
    this.expose.push(item)
    this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
  }

  /**
   * 移除指定名称的暴露属性
   *
   * @param name - 暴露属性名
   */
  removeExpose(name: string): void {
    const idx = this.expose.findIndex((e) => e.name === name)
    if (idx > -1) {
      this.expose.splice(idx, 1)
      this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
    }
  }

  /**
   * 添加插槽定义（对应 defineSlots）
   *
   * @param slot - 插槽定义项
   *
   * @example
   * ```ts
   * block.addSlot({ name: 'default', description: '默认内容区' })
   * block.addSlot({ name: 'header', props: [{ name: 'title', type: 'string' }] })
   * ```
   */
  addSlot(slot: SlotDefinition): void {
    this.slots.push(slot)
    this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
  }

  /**
   * 移除指定名称的插槽定义
   *
   * @param name - 插槽名
   */
  removeSlot(name: string): void {
    const idx = this.slots.findIndex((s) => s.name === name)
    if (idx > -1) {
      this.slots.splice(idx, 1)
      this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
    }
  }

  /**
   * 更新指定插槽定义
   *
   * @param name - 插槽名
   * @param updates - 要合并更新的字段
   */
  updateSlot(name: string, updates: Partial<SlotDefinition>): void {
    const slot = this.slots.find((s) => s.name === name)
    if (slot) {
      Object.assign(slot, updates)
      this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
    }
  }

  /**
   * 添加生命周期钩子
   *
   * @param hook - 生命周期钩子定义项
   *
   * @example
   * ```ts
   * block.addLifecycleHook({ name: 'onMounted', value: '() => { fetchData() }' })
   * ```
   */
  addLifecycleHook(hook: LifecycleHook): void {
    this.lifecycleHooks.push(hook)
    this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
  }

  /**
   * 移除指定名称的生命周期钩子
   *
   * @param name - 钩子名（如 'onMounted'）
   */
  removeLifecycleHook(name: string): void {
    const idx = this.lifecycleHooks.findIndex((h) => h.name === name)
    if (idx > -1) {
      this.lifecycleHooks.splice(idx, 1)
      this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
    }
  }

  /**
   * 更新指定生命周期钩子的函数体
   *
   * @param name - 钩子名
   * @param value - 新的函数体表达式字符串
   */
  updateLifecycleHook(name: string, value: string): void {
    const hook = this.lifecycleHooks.find((h) => h.name === name)
    if (hook) {
      hook.value = value
      this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
    }
  }

  /**
   * 添加注入声明（对应 inject）
   *
   * @param decl - 注入声明项
   *
   * @example
   * ```ts
   * block.addInject({ name: 'config', from: 'AppConfig', defaultValue: '{}' })
   * ```
   */
  addInject(decl: InjectDeclaration): void {
    this.inject.push(decl)
    this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
  }

  /**
   * 移除指定名称的注入声明
   *
   * @param name - 注入名
   */
  removeInject(name: string): void {
    const idx = this.inject.findIndex((i) => i.name === name)
    if (idx > -1) {
      this.inject.splice(idx, 1)
      this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
    }
  }

  /**
   * 更新指定注入声明
   *
   * @param name - 注入名
   * @param updates - 要合并更新的字段
   */
  updateInject(name: string, updates: Partial<InjectDeclaration>): void {
    const decl = this.inject.find((i) => i.name === name)
    if (decl) {
      Object.assign(decl, updates)
      this.eventBus.emit(DesignerEventType.PageUpdated, { pageId: this.id })
    }
  }

  // ── 序列化 ─────────────────────────────────────────

  /**
   * 将 BlockModel 序列化为 JSON 对象
   *
   * 用于持久化存储、项目导出、跨进程传输等场景。
   * 返回纯数据对象，不包含方法引用。
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
   * 用于从持久化存储加载项目、导入文件等场景。
   * 递归还原 rootNode 下的整棵节点树。
   *
   * @param json - 序列化的 BlockModelJSON 对象
   * @param eventBus - 事件总线实例，注入到新创建的 BlockModel 中
   * @returns 还原的 BlockModel 实例
   */
  static fromJSON(json: BlockModelJSON, eventBus: IEventBus): BlockModel {
    const block = new BlockModel(eventBus, json.name, {
      id: json.id,
      route: json.route,
    })
    if (json.rootNode) {
      block.rootNode = NodeModel.fromJSON(json.rootNode, eventBus)
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
}
