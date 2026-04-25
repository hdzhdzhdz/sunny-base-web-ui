/**
 * ProjectModel - 项目模型
 *
 * 三层数据模型的最顶层，对应「项目」层。
 * 管理整个低代码应用的数据，是 Engine 持有的根对象。
 *
 * ## 核心职责
 *
 * 1. **pages** — 管理应用的所有页面/组件（BlockModel 列表）
 * 2. **activePageId** — 跟踪当前激活的页面（画布渲染器根据此字段决定展示哪个页面）
 * 3. **dependencies** — 管理项目的外部 npm 依赖声明（代码生成时转换为 import 语句）
 * 4. **apis** — 管理项目的 API 接口定义（供页面内的方法调用）
 *
 * ## 事件通信
 *
 * - `switchPage()` 广播 EVENT_PAGE_SWITCH（含 fromPageId / toPageId）
 * - 其他变更（添加/删除页面、依赖、API）广播 EVENT_PROJECT_LOAD
 *
 * ## 与 Engine 的关系
 *
 * ProjectModel 是纯数据模型，不包含任何 UI 或 History 逻辑。
 * Engine 持有 ProjectModel 实例，通过它操作数据，再由 Engine 协调其他子系统。
 *
 * @example
 * ```ts
 * const project = new ProjectModel('我的项目')
 *
 * // 添加页面
 * const page = new BlockModel('首页', { route: '/' })
 * project.addPage(page)
 *
 * // 切换页面
 * project.switchPage(page.id)
 *
 * // 获取当前页面
 * const activePage = project.getActivePage()
 *
 * // 管理依赖
 * project.addDependency({ package: 'lodash-es', version: '^4.17.21' })
 *
 * // 序列化
 * const json = project.toJSON()
 * const restored = ProjectModel.fromJSON(json)
 * ```
 */
import { nanoid } from 'nanoid'
import { emitter, EVENT_PAGE_SWITCH, EVENT_PROJECT_LOAD } from '../emitter'
import { BlockModel } from './block-model'
import type {
  ApiDefinition,
  DependencyDeclaration,
  ProjectModelJSON,
} from './types'

export class ProjectModel {
  /** 项目唯一标识（自动生成，可通过 options.id 指定用于反序列化） */
  readonly id: string

  /**
   * 项目名称
   *
   * 用于显示项目标题，代码生成时作为项目标识。
   */
  name: string

  /**
   * 页面/组件列表
   *
   * 每个 BlockModel 代表一个独立的页面或可复用组件。
   * 页面通过 route 关联到 URL 路径。
   */
  pages: BlockModel[]

  /**
   * 当前激活页面的 ID
   *
   * 画布渲染器根据此字段决定展示哪个页面。
   * 初始为空字符串，添加第一个页面时自动设置。
   * 切换页面时由 switchPage() 更新。
   */
  activePageId: string

  /**
   * 外部依赖声明列表
   *
   * 声明项目运行时需要的 npm 包，代码生成时转换为 import 语句。
   * 同一个包名只会保留一个版本（后注册的覆盖先注册的）。
   *
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

  /**
   * 创建 ProjectModel 实例
   *
   * @param name - 项目名称
   * @param options - 可选配置
   * @param options.id - 指定 ID（用于反序列化），默认自动生成
   */
  constructor(
    name: string,
    options?: {
      id?: string
    },
  ) {
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
   * 广播 EVENT_PROJECT_LOAD 事件。
   *
   * @param page - 要添加的 BlockModel 实例
   */
  addPage(page: BlockModel): void {
    this.pages.push(page)
    if (this.pages.length === 1) {
      this.activePageId = page.id
    }
    this._emitChanged()
  }

  /**
   * 从项目中移除指定页面
   *
   * 如果移除的是当前激活页面，自动切换到剩余的第一个页面。
   * 广播 EVENT_PROJECT_LOAD 事件。
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
    this._emitChanged()
  }

  /**
   * 切换当前激活页面
   *
   * 画布渲染器会根据 activePageId 展示对应的页面。
   * 广播 EVENT_PAGE_SWITCH 事件（含 fromPageId / toPageId）。
   *
   * @param pageId - 目标页面 ID（必须存在于 pages 中）
   */
  switchPage(pageId: string): void {
    const page = this.pages.find((p) => p.id === pageId)
    if (!page) return
    const fromId = this.activePageId
    this.activePageId = pageId
    emitter.emit(EVENT_PAGE_SWITCH, {
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
   * 广播 EVENT_PROJECT_LOAD 事件。
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
   * @param api - API 定义对象（会浅拷贝存储）
   */
  addApi(api: ApiDefinition): void {
    this.apis.push({ ...api })
    this._emitChanged()
  }

  /**
   * 移除指定 API 接口定义
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
   * 更新指定 API 接口定义（部分更新）
   *
   * @param apiId - 要更新的 API ID
   * @param updates - 要更新的字段
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
   * 序列化为 JSON 对象
   *
   * 递归序列化所有页面。用于持久化存储、项目导出、跨进程传输。
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
   * 递归还原所有页面及其节点树。
   *
   * @param json - 序列化的 ProjectModelJSON 对象
   * @returns 还原的 ProjectModel 实例
   */
  static fromJSON(json: ProjectModelJSON): ProjectModel {
    const project = new ProjectModel(json.name, { id: json.id })
    project.pages = json.pages.map((p) => BlockModel.fromJSON(p))
    project.activePageId = json.activePageId
    project.dependencies = json.dependencies.map((d) => ({ ...d }))
    project.apis = json.apis.map((a) => ({ ...a }))
    return project
  }

  // ── 内部 ────────────────────────────────────────────────

  /** 广播项目变更事件 */
  private _emitChanged(): void {
    emitter.emit(EVENT_PROJECT_LOAD, { projectId: this.id })
  }
}
