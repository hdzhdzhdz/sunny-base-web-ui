import { ref, computed, readonly } from 'vue';

/**
 * 全局加载状态管理器
 * @description 单例模式，管理全局加载动画的显示状态，支持并发请求
 */
export class LoadingManager {
  private static instance: LoadingManager;

  private _loadingCount = ref(0);

  /**
   * 当前加载计数（只读）
   */
  readonly loadingCount = readonly(this._loadingCount);

  /**
   * 当前是否处于加载状态（响应式）
   */
  readonly isLoading = computed(() => {
    const result = this._loadingCount.value > 0;
    console.log('[LoadingManager] isLoading computed:', result, 'count:', this._loadingCount.value);
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
   * 开始加载（增加计数）
   */
  startLoading(): void {
    console.log('[LoadingManager] startLoading called, current count:', this._loadingCount.value);
    this._loadingCount.value++;
    console.log('[LoadingManager] After startLoading, count:', this._loadingCount.value);
  }

  /**
   * 结束加载（减少计数）
   */
  stopLoading(): void {
    console.log('[LoadingManager] stopLoading called, current count:', this._loadingCount.value);
    if (this._loadingCount.value > 0) {
      this._loadingCount.value--;
    }
    console.log('[LoadingManager] After stopLoading, count:', this._loadingCount.value);
  }

  /**
   * 强制停止所有加载（重置计数）
   */
  forceStop(): void {
    console.log('[LoadingManager] forceStop called');
    this._loadingCount.value = 0;
  }
}

// 导出单例
export const loadingManager = LoadingManager.getInstance();

