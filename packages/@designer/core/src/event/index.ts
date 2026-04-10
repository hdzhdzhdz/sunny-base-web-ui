/**
 * 设计器事件类型
 */
export enum DesignerEventType {
  // Node
  NodeAdded = 'node:added',
  NodeRemoved = 'node:removed',
  NodeMoved = 'node:moved',
  NodePropsChanged = 'node:propsChanged',
  NodeEventsChanged = 'node:eventsChanged',
  NodeDirectiveChanged = 'node:directiveChanged',

  // Page
  PageAdded = 'page:added',
  PageRemoved = 'page:removed',
  PageSwitched = 'page:switched',
  PageUpdated = 'page:updated',

  // Project
  ProjectLoaded = 'project:loaded',
  ProjectChanged = 'project:changed',

  // Block JS
  StateChanged = 'block:stateChanged',
  ComputedChanged = 'block:computedChanged',
  MethodChanged = 'block:methodChanged',
  WatchChanged = 'block:watchChanged',
  CssChanged = 'block:cssChanged',

  // History
  HistoryChanged = 'history:changed',
  HistoryRestoring = 'history:restoring',
  HistoryRestored = 'history:restored',

  // Selection
  SelectionChanged = 'selection:changed',

  // Simulator
  SimulatorReady = 'simulator:ready',
  SimulatorDestroyed = 'simulator:destroyed',
}

/**
 * 事件映射（类型安全）
 */
export interface DesignerEventMap {
  [DesignerEventType.NodeAdded]: { nodeId: string; parentId: string | null; index: number }
  [DesignerEventType.NodeRemoved]: { nodeId: string; parentId: string | null }
  [DesignerEventType.NodeMoved]: { nodeId: string; fromParent: string | null; toParent: string | null; fromIndex: number; toIndex: number }
  [DesignerEventType.NodePropsChanged]: { nodeId: string; propName: string; oldValue: any; newValue: any }
  [DesignerEventType.NodeEventsChanged]: { nodeId: string; eventName: string; oldValue: string; newValue: string }
  [DesignerEventType.NodeDirectiveChanged]: { nodeId: string; directiveName: string; action: 'add' | 'remove' | 'update' }

  [DesignerEventType.PageAdded]: { pageId: string }
  [DesignerEventType.PageRemoved]: { pageId: string }
  [DesignerEventType.PageSwitched]: { fromPageId: string; toPageId: string }
  [DesignerEventType.PageUpdated]: { pageId: string }

  [DesignerEventType.ProjectLoaded]: { projectId: string }
  [DesignerEventType.ProjectChanged]: { projectId: string }

  [DesignerEventType.StateChanged]: { blockId: string; name: string; action: 'add' | 'remove' | 'update' }
  [DesignerEventType.ComputedChanged]: { blockId: string; name: string; action: 'add' | 'remove' | 'update' }
  [DesignerEventType.MethodChanged]: { blockId: string; name: string; action: 'add' | 'remove' | 'update' }
  [DesignerEventType.WatchChanged]: { blockId: string; name: string; action: 'add' | 'remove' | 'update' }
  [DesignerEventType.CssChanged]: { blockId: string; blockId_css: string; action: 'add' | 'remove' | 'update' }

  [DesignerEventType.HistoryChanged]: { cursor: number; total: number; canUndo: boolean; canRedo: boolean }
  [DesignerEventType.HistoryRestoring]: { snapshotId: string }
  [DesignerEventType.HistoryRestored]: { snapshotId: string; blockId: string }

  [DesignerEventType.SelectionChanged]: { selectedIds: string[]; blockId: string | null }

  [DesignerEventType.SimulatorReady]: Record<string, never>
  [DesignerEventType.SimulatorDestroyed]: Record<string, never>
}

export type EventHandler<T = any> = (payload: T) => void

export { EventBus } from './event-bus'

/**
 * 事件总线接口
 */
export interface IEventBus {
  on<K extends keyof DesignerEventMap>(event: K, handler: EventHandler<DesignerEventMap[K]>): () => void
  off<K extends keyof DesignerEventMap>(event: K, handler: EventHandler<DesignerEventMap[K]>): void
  emit<K extends keyof DesignerEventMap>(event: K, payload: DesignerEventMap[K]): void
  once<K extends keyof DesignerEventMap>(event: K, handler: EventHandler<DesignerEventMap[K]>): () => void
  clear(): void
}
