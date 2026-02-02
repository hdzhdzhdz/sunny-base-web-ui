import { App, InjectionKey, inject } from 'vue'

/**
 * @effects 包的全局配置接口
 * 用于在应用启动时注入通用配置，避免在每个组件中重复传参
 */
export interface EffectsConfig {
  /**
   * API 请求前缀
   * @example '/crm' -> 请求地址变为 /crm/login
   */
  apiPrefix?: string
  /**
   * 单点登录 (SSO) 的服务地址参数
   * 通常用于拼接在 SSO 登录链接的 service 参数中
   * @example 'http://crm.example.com'
   */
  ssoUrl?: string
  /**
   * 当前语言环境
   * @example 'zh-CN'
   */
  locale?: string
  /**
   * 是否启用 Refresh Token
   */
  enableRefreshToken?: boolean
  /**
   * RSA 公钥
   */
  publicKey?: string
  /**
   * 头部配置
   */
  header?: {
    height: number
  }
  /**
   * 应用配置
   */
  app?: {
    name: string
  }
  /**
   * Logo 配置
   */
  logo?: {
    enable: boolean
    fit?: string
    source: string
  }
  /**
   * 侧边栏配置
   */
  sidebar?: {
    width: number
  }
}

/**
 * Vue 依赖注入的 Key
 * 用于在组件内部通过 inject 获取配置对象
 */
export const EFFECTS_CONFIG_KEY: InjectionKey<EffectsConfig> = Symbol('EFFECTS_CONFIG')

/**
 * 全局配置对象，用于在非 Vue 组件环境（如 API 请求）中访问配置
 */
export let globalConfig: EffectsConfig = {}

/**
 * 创建 @effects 插件实例
 * 在 Vue 应用入口文件 (main.ts/bootstrap.ts) 中使用 app.use() 安装
 * 
 * @param config 全局配置对象
 * @returns Vue 插件对象
 * 
 * @example
 * ```ts
 * app.use(createEffects({
 *   apiPrefix: '/crm',
 *   ssoUrl: 'http://crm.example.com'
 * }))
 * ```
 */
export const createEffects = (config: EffectsConfig) => {
  globalConfig = { ...config }
  return {
    install(app: App) {
      // 将配置注入到全局应用上下文中
      app.provide(EFFECTS_CONFIG_KEY, config)
    }
  }
}

/**
 * Composition API Hook: 获取全局配置
 * 在组件 setup() 中调用此方法获取配置信息
 * 
 * @returns EffectsConfig 配置对象
 */
export const useEffectsConfig = () => {
  return inject(EFFECTS_CONFIG_KEY, {})
}