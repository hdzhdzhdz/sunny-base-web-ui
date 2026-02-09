import type { BusinessSearchConfig } from '../types';

// 静态配置注册表
const registry: Record<string, () => Promise<BusinessSearchConfig>> = {
  // 示例：动态导入
  // 'user': () => import('./user').then(m => m.default),
};

/**
 * 获取业务配置
 * @param type 业务类型
 */
export async function getBusinessConfig(type: string): Promise<BusinessSearchConfig | null> {
  const loader = registry[type];
  if (loader) {
    return await loader();
  }
  console.warn(`[SunnyBusinessSearch] Config for type "${type}" not found.`);
  return null;
}

/**
 * 注册业务配置
 * @param type 业务类型
 * @param config 配置加载函数
 */
export function registerBusinessConfig(type: string, configLoader: () => Promise<BusinessSearchConfig>) {
  registry[type] = configLoader;
}
