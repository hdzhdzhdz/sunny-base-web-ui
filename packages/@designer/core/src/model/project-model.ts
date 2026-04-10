import { nanoid } from 'nanoid'
import type { IEventBus } from '../event/index'
import { DesignerEventType } from '../event/index'
import { BlockModel } from './block-model'
import type {
  ApiDefinition,
  DependencyDeclaration,
  ProjectModelJSON,
} from './types'

/**
 * ProjectModel - 项目模型
 *
 * 对应用户架构中的「项目」层，管理整个低代码应用的数据。
 * 一个 ProjectModel 包含多个页面（BlockModel）、外部依赖声明和 API 定义。
 *
 * 核心职责：
 * - **pages**：管理应用的所有页面/组件（BlockModel 列表）
 * - **activePageId**：跟踪当前激活的页面（用于画布渲染）
 * - **dependencies**：管理项目的外部 npm 依赖声明（代码生成时使用）
 * - **apis**：管理项目的 API 接口定义（供页面内的方法调用）
 *
 * 所有变更操作都会通过 EventBus 发射事件，供 Engine / History / UI 层监听响应。
 * ProjectModel 是三层模型的顶层容器，通常由 Engine 持有和管理。
 *
 * @example
 * ```ts
 * const project = new ProjectModel(eventBus, '我的项目')
 *
 * // 添加页面
 * const page = new BlockModel(eventBus, '首页', { route: '/' })
 * project.addPage(page)
 *
 * // 切换页面（触发 PageSwitched 事件）
 * project.switchPage(page.id)
 *
 * // 获取当前激活页面
 * const activePage = project.getActivePage()
 *
 * // 管理依赖
 * project.addDependency({ package: 'lodash-es', version: '^4.17.21' })
 *
 * // 管理接口
 * project.addApi({
 *   id: nanoid(),
 *   name: 'getUserList',
 *   url: '/api/users',
 *   method: 'GET',
 * })
 *
 * // 序列化
 * const json = project.toJSON()
 * ```
 */
export class ProjectModel {
  /** 项目唯一标识（自动生成，可用于反序列化指定） */
  readonly id: string
  /** 项目名称 */
  name: string
  /**
   * 页面/组件列表
   *
   * 每个 BlockModel 代表一个独立的页面或可复用组件。
   * 页面通过路由（route）关联到 URL 路径。
   */
  pages: BlockModel[]
  /**
   * 当前激活页面的 ID
   *
   * 画布渲染器根据此字段决定展示哪个页面。
   * 初始为空字符串，添加第一个页面时自动设置。
   */
  activePageId: string
  /**
   * 外部依赖声明列表
   *
   * 声明项目运行时需要的 npm 包，在代码生成阶段会转换为 import 语句。
   * 同一个包名只会保留一个版本（后注册的覆盖先注册的）。
   * @example `[{ package: 'lodash-es', version: '^4.17.21' }]`
   */
  dependencies: DependencyDeclaration[]
  /**
   * API 接口定义列表
   *
   * 定义项目中使用的 HTTP 接口，供页面内方法调用。
   * 代码生成时可根据这些定义生成 API 请求函数。
   */
  apis: ApiDefinition[]

  /** 事件总线实例，用于发射项目级变更事件 */
  private readonly eventBus: IEventBus

  /**
   * 创建 ProjectModel 实例
   *
   * @param eventBus - 事件总线实例
   * @param name - 项目名称
   * @param options - 可选配置
   * @param options.id - 指定 ID（用于反序列化），默认自动生成
   */
  constructor(
    eventBus: IEventBus,
    name: string,
    options?: {
      id?: string
    },
  ) {
    this.eventBus = eventBus
    this.id = options?.id ?? nanoid()
    this.name = name
    this.pages = []
    this.activePageId = ''
    this.dependencies = []
    this.apis = []
  }

  // ── 页面管理 ───────────────────────────────────────────

  /**
   * 添加页面到项目
   *
   * 将页面追加到 pages 列表末尾。如果是第一个页面，自动设为激活页面。
   * 触发 {@link DesignerEventType.PageAdded} 和 {@link DesignerEventType.ProjectChanged} 事件。
   *
   * @param page - 要添加的 BlockModel 实例
   */
  addPage(page: BlockModel): void {
    this.pages.push(page)
    if (this.pages.length === 1) {
      this.activePageId = page.id
    }
    this.eventBus.emit(DesignerEventType.PageAdded, { pageId: page.id })
    this._emitChanged()
  }

  /**
   * 从项目中移除指定页面
   *
   * 如果移除的是当前激活页面，自动切换到剩余的第一个页面。
   * 触发 {@link DesignerEventType.PageRemoved} 和 {@link DesignerEventType.ProjectChanged} 事件。
   *
   * @param pageId - 要移除的页面 ID
   */
  removePage(pageId: string): void {
    const idx = this.pages.findIndex((p) => p.id === pageId)
    if (idx === -1) return
    this.pages.splice(idx, 1)
    if (this.activePageId === pageId) {
      this.activePageId = this.pages.length > 0 ? this.pages[0].id : ''
    }
    this.eventBus.emit(DesignerEventType.PageRemoved, { pageId })
    this._emitChanged()
  }

  /**
   * 切换当前激活页面
   *
   * 画布渲染器会根据 activePageId 展示对应的页面。
   * 触发 {@link DesignerEventType.PageSwitched} 事件。
   *
   * @param pageId - 目标页面 ID（必须存在于 pages 中）
   */
  switchPage(pageId: string): void {
    const page = this.pages.find((p) => p.id === pageId)
    if (!page) return
    const fromId = this.activePageId
    this.activePageId = pageId
    this.eventBus.emit(DesignerEventType.PageSwitched, {
      fromPageId: fromId,
      toPageId: pageId,
    })
  }

  /**
   * 获取当前激活的页面
   *
   * @returns 当前激活的 BlockModel 实例，无激活页面时返回 null
   */
  getActivePage(): BlockModel | null {
    return this.pages.find((p) => p.id === this.activePageId) ?? null
  }

  /**
   * 根据 ID 获取指定页面
   *
   * @param pageId - 页面 ID
   * @returns 对应的 BlockModel 实例，不存在时返回 null
   */
  getPage(pageId: string): BlockModel | null {
    return this.pages.find((p) => p.id === pageId) ?? null
  }

  // ── 依赖管理 ───────────────────────────────────────────

  /**
   * 添加或更新外部依赖
   *
   * 如果同名包已存在，更新其版本号；否则添加新依赖。
   * 触发 {@link DesignerEventType.ProjectChanged} 事件。
   *
   * @param dep - 依赖声明（包名 + 版本）
   *
   * @example
   * ```ts
   * project.addDependency({ package: 'dayjs', version: '^1.11.10' })
   * ```
   */
  addDependency(dep: DependencyDeclaration): void {
    const existing = this.dependencies.find((d) => d.package === dep.package)
    if (existing) {
      existing.version = dep.version
    } else {
      this.dependencies.push({ ...dep })
    }
    this._emitChanged()
  }

  /**
   * 移除指定外部依赖
   *
   * 触发 {@link DesignerEventType.ProjectChanged} 事件。
   *
   * @param packageName - 要移除的包名
   */
  removeDependency(packageName: string): void {
    const idx = this.dependencies.findIndex((d) => d.package === packageName)
    if (idx > -1) {
      this.dependencies.splice(idx, 1)
      this._emitChanged()
    }
  }

  // ── API 管理 ───────────────────────────────────────────

  /**
   * 添加 API 接口定义
   *
   * 触发 {@link DesignerEventType.ProjectChanged} 事件。
   *
   * @param api - API 定义对象
   *
   * @example
   * ```ts
   * project.addApi({
   *   id: nanoid(),
   *   name: 'getUserList',
   *   url: '/api/users',
   *   method: 'GET',
   *   description: '获取用户列表',
   * })
   * ```
   */
  addApi(api: ApiDefinition): void {
    this.apis.push({ ...api })
    this._emitChanged()
  }

  /**
   * 移除指定 API 接口定义
   *
   * 触发 {@link DesignerEventType.ProjectChanged} 事件。
   *
   * @param apiId - 要移除的 API ID
   */
  removeApi(apiId: string): void {
    const idx = this.apis.findIndex((a) => a.id === apiId)
    if (idx > -1) {
      this.apis.splice(idx, 1)
      this._emitChanged()
    }
  }

  /**
   * 更新指定 API 接口定义
   *
   * 使用 Object.assign 合并更新字段。
   * 触发 {@link DesignerEventType.ProjectChanged} 事件。
   *
   * @param apiId - 要更新的 API ID
   * @param updates - 要更新的字段（部分更新）
   */
  updateApi(apiId: string, updates: Partial<ApiDefinition>): void {
    const api = this.apis.find((a) => a.id === apiId)
    if (api) {
      Object.assign(api, updates)
      this._emitChanged()
    }
  }

  // ── 序列化 ─────────────────────────────────────────────

  /**
   * 将 ProjectModel 序列化为 JSON 对象
   *
   * 递归序列化所有页面。用于持久化存储、项目导出、跨进程传输等场景。
   *
   * @returns 可 JSON.stringify 的 ProjectModelJSON 对象
   */
  toJSON(): ProjectModelJSON {
    return {
      id: this.id,
      name: this.name,
      pages: this.pages.map((p) => p.toJSON()),
      activePageId: this.activePageId,
      dependencies: this.dependencies.map((d) => ({ ...d })),
      apis: this.apis.map((a) => ({ ...a })),
    }
  }

  /**
   * 从 JSON 对象反序列化为 ProjectModel 实例
   *
   * 递归还原所有页面及其组件树。
   *
   * @param json - 序列化的 ProjectModelJSON 对象
   * @param eventBus - 事件总线实例，注入到所有创建的模型中
   * @returns 还原的 ProjectModel 实例
   */
  static fromJSON(json: ProjectModelJSON, eventBus: IEventBus): ProjectModel {
    const project = new ProjectModel(eventBus, json.name, { id: json.id })
    project.pages = json.pages.map((p) => BlockModel.fromJSON(p, eventBus))
    project.activePageId = json.activePageId
    project.dependencies = json.dependencies.map((d) => ({ ...d }))
    project.apis = json.apis.map((a) => ({ ...a }))
    return project
  }

  /**
   * 发射项目变更事件（内部方法）
   */
  private _emitChanged(): void {
    this.eventBus.emit(DesignerEventType.ProjectChanged, { projectId: this.id })
  }
}
