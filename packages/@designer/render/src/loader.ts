/**
 * ComponentLoader - 组件查找器
 *
 * 负责将节点名称解析为实际的 Vue 组件。
 * 支持三种查找策略：
 * 1. MaterialStore 查找：从 MaterialStore 中获取已注册组件
 * 2. Schema 加载：异步加载 BlockSchema 并通过 createRenderer 递归渲染
 * 3. 回退占位符：未找到时返回占位组件
 *
 * @example
 * ```ts
 * const loader = createLoader({
 *   materialStore,
 *   schemaLoader: async (id) => fetchSchema(id),
 * })
 *
 * const component = loader.load('SunnyButton')       // 同步
 * const asyncComp = await loader.load('SubBlock', 'schema:block-123')  // 异步
 * ```
 */
import { defineComponent, h, type Component } from 'vue'
import type { MaterialStore } from '@sunny-base-web/designer-materials'
import type { BlockModelJSON } from '@sunny-base-web/designer-core'

/**
 * 组件加载器接口
 */
export interface ComponentLoader {
  /**
   * 加载组件
   *
   * @param name - 组件名称
   * @param from - 组件来源标识（可选）
   *   - undefined / 普通字符串 → 从 MaterialStore 查找
   *   - 'schema:<id>' → 异步加载 BlockSchema 并递归渲染
   * @returns Vue 组件（同步返回），或 Promise<Component>（异步加载时）
   */
  load(name: string, from?: string): Component | Promise<Component>
}

/**
 * Schema 异步加载函数类型
 */
export type SchemaLoader = (id: string) => Promise<BlockModelJSON>

/**
 * 创建组件加载器
 *
 * @param options.materialStore - 物料存储（必需）
 * @param options.schemaLoader - Schema 异步加载函数（可选）
 */
export function createLoader(options: {
  materialStore: MaterialStore
  schemaLoader?: SchemaLoader
}): ComponentLoader {
  const { materialStore, schemaLoader } = options

  return {
    load(name: string, from?: string): Component | Promise<Component> {
      // ── 策略 2：异步加载子 Schema ────────────────────
      if (from?.startsWith('schema:')) {
        const schemaId = from.slice('schema:'.length)
        if (schemaLoader) {
          return loadSchemaAsComponent(schemaId, schemaLoader)
        }
        console.warn(`[Loader] schemaLoader not configured, cannot load: ${from}`)
        return createPlaceholderComponent(name)
      }

      // ── 策略 1：从 MaterialStore 查找 ──────────────────
      const comp = materialStore.getComponent(name)
      if (comp) {
        return comp
      }

      // ── 策略 3：未找到 → 占位符 ──────────────────────
      console.warn(`[Loader] Component not found: ${name}`)
      return createPlaceholderComponent(name)
    },
  }
}

/**
 * 异步加载 Schema 并转为 Vue 组件
 */
async function loadSchemaAsComponent(
  schemaId: string,
  schemaLoader: SchemaLoader,
): Promise<Component> {
  try {
    const schema = await schemaLoader(schemaId)
    const { createRenderer } = await import('./block')
    return createRenderer(schema)
  } catch (e) {
    console.warn(`[Loader] Failed to load schema: ${schemaId}`, e)
    return createPlaceholderComponent(`Schema:${schemaId}`)
  }
}

/**
 * 创建占位符组件
 */
function createPlaceholderComponent(name: string): Component {
  return defineComponent({
    name: 'PlaceholderComponent',
    setup() {
      return () =>
        h('div', {
          class: 'sunny-renderer-placeholder',
          style: {
            padding: '8px 12px',
            border: '1px dashed #ccc',
            borderRadius: '4px',
            color: '#999',
            fontSize: '12px',
          },
        }, [`未注册组件: ${name}`])
    },
  })
}
