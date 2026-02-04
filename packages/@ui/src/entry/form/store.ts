import { Store as TanStackStore } from '@tanstack/store';

/**
 * 表单配置状态管理 Store
 * Form Configuration State Management Store
 * 
 * 这个文件主要用于管理表单的“配置状态”（例如：schema, layout, collapsed, loading 等），
 * 而不是表单的“数据值”（Values 由 vee-validate 管理）。
 * 
 * 它封装了 @tanstack/store，提供了一个轻量级的、外部可控的状态容器。
 * 
 * This file is mainly used to manage the "configuration state" of the form (e.g., schema, layout, collapsed, loading, etc.),
 * not the "data values" of the form (Values are managed by vee-validate).
 * 
 * It wraps @tanstack/store, providing a lightweight, externally controllable state container.
 */
export class Store<T extends object> {
  // 核心 TanStack Store 实例 / Core TanStack Store instance
  public store: TanStackStore<T>;

  /**
   * 初始化 Store
   * Initialize Store
   * 
   * @param initialState 初始状态 / Initial state
   * @param options 配置项 / Configuration options
   */
  constructor(initialState: T, options?: { onUpdate?: () => void }) {
    this.store = new TanStackStore(initialState);

    // 如果提供了 onUpdate 回调，订阅 store 变化
    // If onUpdate callback is provided, subscribe to store changes
    if (options?.onUpdate) {
      this.store.subscribe(() => {
        options.onUpdate?.();
      });
    }
  }

  /**
   * 更新状态
   * Update state
   * 
   * 支持传入部分状态对象或更新函数。
   * Supports passing a partial state object or an update function.
   * 
   * @param partialState 部分状态或更新函数 / Partial state or update function
   */
  public setState(
    partialState: Partial<T> | ((state: T) => Partial<T>)
  ) {
    this.store.setState((prev) => {
      const newState =
        typeof partialState === 'function'
          ? partialState(prev)
          : partialState;
      
      return { ...prev, ...newState };
    });
  }

  /**
   * 获取当前状态快照
   * Get current state snapshot
   * 
   * @returns 当前状态对象 / Current state object
   */
  public getState(): T {
    return this.store.state;
  }
}
