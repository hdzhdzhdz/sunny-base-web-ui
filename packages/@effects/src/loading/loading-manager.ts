import { ref, computed } from 'vue';

/**
 * 全局加载状态管理器
 * @description 单例模式，管理全局加载动画的显示状态
 * @since 简化版：仅使用布尔值，不使用计数器（因为只处理路由导航）
 */
export class LoadingManager {
  private static instance: LoadingManager;

  private _isLoading = ref(false);

  /**
   * 当前是否处于加载状态（响应式）
   */
  readonly isLoading = computed(() => {
    const result = this._isLoading.value;
    console.log('[LoadingManager] isLoading computed:', result);
    return result;
  });

  private constructor() {
    console.log('[LoadingManager] Instance created');
  }

  /**
   * 获取单例实例
   */
  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  /**
   * 开始加载
   */
  startLoading(): void {
    console.log('[LoadingManager] startLoading called');
    this._isLoading.value = true;
  }

  /**
   * 结束加载
   */
  stopLoading(): void {
    console.log('[LoadingManager] stopLoading called');
    this._isLoading.value = false;
  }

  /**
   * 强制停止加载（等同于 stopLoading，为了保持 API 兼容性）
   */
  forceStop(): void {
    console.log('[LoadingManager] forceStop called');
    this._isLoading.value = false;
  }
}

// 导出单例
export const loadingManager = LoadingManager.getInstance();

