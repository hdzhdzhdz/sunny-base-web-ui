/**
 * Model 模块 - 三层数据模型
 *
 * 数据模型层级关系：
 * ```
 * ProjectModel            ← 项目（多页面、依赖、API 定义）
 *   └─ BlockModel[]       ← 页面/组件（节点树 + JS 声明 + CSS）
 *       └─ NodeModel      ← UI 节点（组件标签，对应模板中的一个元素）
 *           └─ NodeModel[] ← 子节点（树形递归）
 * ```
 *
 * 所有模型变更通过全局 emitter 广播事件，不依赖构造函数注入。
 */
export type {
  DirectiveBinding,
  JsDeclaration,
  CssBlock,
  ApiDefinition,
  DependencyDeclaration,
  PropDefinition,
  EmitDefinition,
  ExposeDefinition,
  SlotDefinition,
  LifecycleHook,
  InjectDeclaration,
  DropPosition,
  NodeModelJSON,
  BlockModelJSON,
  ProjectModelJSON,
} from './types'

// 三层模型
export { NodeModel } from './node-model'
export { BlockModel } from './block-model'
export { ProjectModel } from './project-model'
