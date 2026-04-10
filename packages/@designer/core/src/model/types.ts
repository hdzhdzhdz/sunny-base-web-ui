/**
 * Model 层公共类型定义
 */

/** 节点投放位置（拖拽时使用） */
export type DropPosition = 'before' | 'after' | 'inside'

/** 指令绑定 */
export interface DirectiveBinding {
  /** 指令名（如 'show', 'if', 'for'） */
  name: string
  /** 表达式字符串（如 'visible', 'item in list'） */
  value: string
  /** 指令参数 */
  arg?: string
  /** 修饰符 */
  modifiers?: string[]
}

/** JS 声明项（state / computed / methods / watch 共用） */
export interface JsDeclaration {
  /** 变量/函数名 */
  name: string
  /** 声明类型 */
  type: 'state' | 'computed' | 'method' | 'watch'
  /** 初始值或函数体（表达式字符串） */
  value: string
  /** 参数列表（methods / watch 使用） */
  params?: string[]
  /** 注释说明 */
  description?: string
}

/** CSS 样式块 */
export interface CssBlock {
  /** 唯一标识 */
  id: string
  /** CSS 选择器 */
  selector: string
  /** CSS 属性键值对 */
  properties: Record<string, string>
}

/** API 定义 */
export interface ApiDefinition {
  /** 唯一标识 */
  id: string
  /** API 名称 */
  name: string
  /** 请求地址 */
  url: string
  /** 请求方法 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** 请求参数 */
  params?: Record<string, any>
  /** 请求头 */
  headers?: Record<string, string>
  /** 描述 */
  description?: string
}

/** 外部依赖声明 */
export interface DependencyDeclaration {
  /** 包名 */
  package: string
  /** 版本 */
  version: string
}

// ── Vue SFC 编译宏相关类型 ────────────────────────────

/** 组件参数定义项（对应 defineProps） */
export interface PropDefinition {
  /** 属性名 */
  name: string
  /** 属性类型（如 'String', 'Number', 'Boolean', 'Array', 'Object', 'Function'） */
  type: string
  /** 是否必填 */
  required?: boolean
  /** 默认值（表达式字符串） */
  defaultValue?: string
  /** 校验函数体（表达式字符串） */
  validator?: string
  /** 属性描述 */
  description?: string
}

/** 组件事件定义项（对应 defineEmits） */
export interface EmitDefinition {
  /** 事件名 */
  name: string
  /** 事件参数列表 */
  params?: { name: string; type: string; description?: string }[]
  /** 事件描述 */
  description?: string
}

/** 暴露的公共属性项（对应 defineExpose） */
export interface ExposeDefinition {
  /** 暴露的属性/方法名 */
  name: string
  /** 类型描述（如 '() => void', 'Ref<string>'） */
  type: string
  /** 描述 */
  description?: string
}

/** 插槽定义项（对应 defineSlots） */
export interface SlotDefinition {
  /** 插槽名（default 为默认插槽） */
  name: string
  /** 插槽描述 */
  description?: string
  /** 插槽 props（如解构的 { item, index }） */
  props?: { name: string; type: string; description?: string }[]
}

/** 生命周期钩子（对应 onMounted / onUnmounted 等） */
export interface LifecycleHook {
  /** 钩子名（如 'onMounted', 'onUnmounted', 'onUpdated' 等） */
  name: string
  /** 回调函数体（表达式字符串） */
  value: string
  /** 描述 */
  description?: string
}

/** 注入声明项（对应 inject） */
export interface InjectDeclaration {
  /** 注入的 key / 名称 */
  name: string
  /** 来源 key（不同于注入名时使用） */
  from?: string
  /** 默认值（表达式字符串） */
  defaultValue?: string
  /** 是否为工厂函数 */
  isFactory?: boolean
  /** 描述 */
  description?: string
}

/** NodeModel 序列化结构 */
export interface NodeModelJSON {
  id: string
  name: string
  /** 组件来源标识（可选，用于 loader 区分组件查找策略）
   *
   * - undefined / 普通字符串 → 从 ComponentRegistry 查找
   * - 'schema:<id>' → 异步加载 BlockSchema 并递归渲染
   */
  from?: string
  props: Record<string, any>
  events: Record<string, string>
  directives: DirectiveBinding[]
  /** 默认插槽子节点 */
  children: NodeModelJSON[]
  /** 具名插槽（key 为插槽名，value 为子节点列表） */
  slots: Record<string, NodeModelJSON[]>
  isContainer: boolean
}

/** BlockModel 序列化结构 */
export interface BlockModelJSON {
  id: string
  name: string
  route: string
  rootNode: NodeModelJSON | null
  state: JsDeclaration[]
  computed: JsDeclaration[]
  methods: JsDeclaration[]
  watch: JsDeclaration[]
  css: CssBlock[]
  props: PropDefinition[]
  emits: EmitDefinition[]
  expose: ExposeDefinition[]
  slots: SlotDefinition[]
  lifecycleHooks: LifecycleHook[]
  inject: InjectDeclaration[]
}

/** ProjectModel 序列化结构 */
export interface ProjectModelJSON {
  id: string
  name: string
  pages: BlockModelJSON[]
  activePageId: string
  dependencies: DependencyDeclaration[]
  apis: ApiDefinition[]
}
