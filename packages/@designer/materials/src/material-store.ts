/**
 * MaterialStore - 物料存储
 *
 * 管理所有已注册的组件元数据（ComponentMeta）。
 * 替代原 render 包中的 ComponentRegistry，统一承担：
 * 1. 组件名 → Vue Component 映射（渲染器用）
 * 2. 组件元数据查询（设计器面板用）
 * 3. 分组/分类查询（左侧面板用）
 * 4. 嵌套规则查询（拖拽引擎用）
 *
 * @example
 * ```ts
 * const store = new MaterialStore()
 *
 * // 注册单个物料
 * store.register({
 *   name: 'SunnyButton',
 *   title: '按钮',
 *   component: SunnyButton,
 *   category: 'basic',
 *   group: '基础组件',
 *   props: [...],
 *   events: [...],
 *   slots: [...],
 *   nestingRules: { isContainer: false },
 *   snippets: [{ title: '基础按钮', props: { type: 'primary' } }],
 * })
 *
 * // 渲染器查找组件
 * const meta = store.getMeta('SunnyButton')
 * const comp = store.getComponent('SunnyButton')
 *
 * // 面板查询
 * const groups = store.getGroups()
 * const basics = store.getByGroup('基础组件')
 * ```
 */
import type { Component } from 'vue'
import type {
  ComponentMeta,
  ComponentCategory,
  NestingRules,
  Snippet,
} from './types'

export class MaterialStore {
  /** 组件元数据映射（name → ComponentMeta） */
  private metas: Map<string, ComponentMeta> = new Map()

  // ── 注册 ──────────────────────────────────────────

  /**
   * 注册一个组件物料
   *
   * @param meta - 组件元数据
   */
  register(meta: ComponentMeta): void {
    if (this.metas.has(meta.name)) {
      console.warn(`[MaterialStore] Overwriting existing material: ${meta.name}`)
    }
    this.metas.set(meta.name, meta)
  }

  /**
   * 批量注册组件物料
   */
  registerAll(metas: ComponentMeta[]): void {
    for (const meta of metas) {
      this.register(meta)
    }
  }

  // ── 查询（渲染器用） ────────────────────────────────

  /**
   * 获取组件元数据
   */
  getMeta(name: string): ComponentMeta | null {
    return this.metas.get(name) ?? null
  }

  /**
   * 获取 Vue 组件引用
   *
   * 替代原 ComponentRegistry.get()。
   */
  getComponent(name: string): Component | null {
    const meta = this.metas.get(name)
    return meta?.component ?? null
  }

  /**
   * 检查组件是否已注册
   */
  has(name: string): boolean {
    return this.metas.has(name)
  }

  /**
   * 获取所有组件名 → Vue 组件映射
   *
   * 用于将物料中的组件批量注册到 Vue App。
   */
  getAllComponents(): Array<[string, Component]> {
    return Array.from(this.metas.entries()).map(([name, meta]) => [name, meta.component])
  }

  /**
   * 获取嵌套规则
   */
  getNestingRules(name: string): NestingRules | null {
    return this.metas.get(name)?.nestingRules ?? null
  }

  /**
   * 获取拖入片段
   */
  getSnippets(name: string): Snippet[] {
    return this.metas.get(name)?.snippets ?? []
  }

  // ── 查询（设计器面板用） ────────────────────────────

  /**
   * 获取所有分组名（去重、排序）
   *
   * 用于左侧面板渲染分组标题。
   */
  getGroups(): string[] {
    const groups = new Set<string>()
    let order = 0
    const groupOrder = new Map<string, number>()

    for (const meta of this.metas.values()) {
      if (meta.hidden) continue
      if (!groups.has(meta.group)) {
        groups.add(meta.group)
        groupOrder.set(meta.group, order++)
      }
    }

    return Array.from(groups)
  }

  /**
   * 按分组获取组件列表
   *
   * 用于左侧面板渲染各组下的组件。
   */
  getByGroup(group: string): ComponentMeta[] {
    return this.filterVisible().filter((m) => m.group === group)
  }

  /**
   * 按分类获取组件列表
   */
  getByCategory(category: ComponentCategory): ComponentMeta[] {
    return this.filterVisible().filter((m) => m.category === category)
  }

  /**
   * 获取所有可见组件（非隐藏）
   */
  getAllVisible(): ComponentMeta[] {
    return this.filterVisible()
  }

  /**
   * 搜索组件（按 name / title / description 匹配）
   */
  search(keyword: string): ComponentMeta[] {
    const lower = keyword.toLowerCase()
    return this.filterVisible().filter(
      (m) =>
        m.name.toLowerCase().includes(lower) ||
        m.title.toLowerCase().includes(lower) ||
        (m.description?.toLowerCase().includes(lower) ?? false),
    )
  }

  // ── 嵌套判断（拖拽引擎用） ──────────────────────────

  /**
   * 判断能否将子组件放入目标容器
   */
  canAcceptChild(parentName: string, childName: string): boolean {
    debugger
    const parent = this.metas.get(parentName)
    if (!parent) return false

    const rules = parent.nestingRules
    if (!rules.isContainer) return false

    // 黑名单
    if (rules.deniedChildren?.includes(childName)) return false

    // 白名单（undefined = 不限制）
    if (rules.allowedChildren && !rules.allowedChildren.includes(childName)) return false

    return true
  }

  /**
   * 判断组件能否作为某父组件的子节点
   */
  canBeChildOf(childName: string, parentName: string): boolean {
    const child = this.metas.get(childName)
    if (!child) return false

    // 子组件的 allowedParents 约束
    const childRules = child.nestingRules
    if (childRules.allowedParents && !childRules.allowedParents.includes(parentName)) {
      return false
    }

    return this.canAcceptChild(parentName, childName)
  }

  // ── 管理 ──────────────────────────────────────────

  /**
   * 取消注册
   */
  unregister(name: string): void {
    this.metas.delete(name)
  }

  /**
   * 清空所有物料
   */
  clear(): void {
    this.metas.clear()
  }

  /**
   * 获取已注册组件数量
   */
  get size(): number {
    return this.metas.size
  }

  // ── 内部 ──────────────────────────────────────────

  /** 过滤隐藏组件 */
  private filterVisible(): ComponentMeta[] {
    return Array.from(this.metas.values()).filter((m) => !m.hidden)
  }
}
