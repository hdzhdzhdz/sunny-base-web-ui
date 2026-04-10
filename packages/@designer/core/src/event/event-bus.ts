import type { IEventBus, EventHandler, DesignerEventMap } from './index'

/**
 * 类型安全的事件总线
 */
export class EventBus implements IEventBus {
  private listeners = new Map<string, Set<EventHandler>>()

  on<K extends keyof DesignerEventMap>(
    event: K,
    handler: EventHandler<DesignerEventMap[K]>,
  ): () => void {
    const key = event as string
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key)!.add(handler as EventHandler)
    return () => this.off(event, handler)
  }

  off<K extends keyof DesignerEventMap>(
    event: K,
    handler: EventHandler<DesignerEventMap[K]>,
  ): void {
    this.listeners.get(event as string)?.delete(handler as EventHandler)
  }

  emit<K extends keyof DesignerEventMap>(
    event: K,
    payload: DesignerEventMap[K],
  ): void {
    this.listeners.get(event as string)?.forEach((handler) => {
      try {
        handler(payload)
      } catch (error) {
        console.error(`[EventBus] Error in handler for "${event as string}":`, error)
      }
    })
  }

  once<K extends keyof DesignerEventMap>(
    event: K,
    handler: EventHandler<DesignerEventMap[K]>,
  ): () => void {
    const wrapper: EventHandler<DesignerEventMap[K]> = (payload) => {
      handler(payload)
      this.off(event, wrapper as EventHandler<DesignerEventMap[K]>)
    }
    return this.on(event, wrapper as EventHandler<DesignerEventMap[K]>)
  }

  clear(): void {
    this.listeners.clear()
  }
}
