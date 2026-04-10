/**
 * @sunny-base-web/designer-core
 *
 * 纯 TypeScript 逻辑引擎，零 Vue 依赖。
 */

// 事件系统
export {
  DesignerEventType,
  EventBus,
} from './event/index'
export type {
  EventHandler,
  DesignerEventMap,
  IEventBus,
} from './event/index'

// 选择系统
export { Selection } from './selection/index'

// 历史系统（撤销/重做）
export { History } from './history/index'
export type { Snapshot, HistoryOptions } from './history/index'

// 数据模型
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
  NodeModelJSON,
  BlockModelJSON,
  ProjectModelJSON,
} from './model/index'
export {
  NodeModel,
  BlockModel,
  ProjectModel,
} from './model/index'
