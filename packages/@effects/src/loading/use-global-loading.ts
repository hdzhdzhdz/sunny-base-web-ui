import { loadingManager } from './loading-manager';

/**
 * 全局加载动画控制 Composable
 * @description 提供编程式控制全局加载动画的 API
 * @example
 * ```ts
 * const { start, stop, withLoading } = useGlobalLoading();
 *
 * // 手动控制
 * start();
 * await fetchData();
 * stop();
 *
 * // 自动包装
 * await withLoading(fetchUserData());
 * ```
 */
export interface UseGlobalLoadingReturn {
  /**
   * 显示全局加载动画
   */
  start: () => void;

  /**
   * 隐藏全局加载动画
   */
  stop: () => void;

  /**
   * 包装异步函数，自动显示/隐藏加载
   * @param fn - 异步函数
   * @example
   * ```ts
   * const { withLoading } = useGlobalLoading();
   * await withLoading(fetchUserData());
   * ```
   */
  withLoading: <T>(fn: Promise<T>) => Promise<T>;
}

export function useGlobalLoading(): UseGlobalLoadingReturn {
  const start = () => loadingManager.startLoading();
  const stop = () => loadingManager.stopLoading();

  const withLoading = async <T>(fn: Promise<T>): Promise<T> => {
    start();
    try {
      return await fn;
    } finally {
      stop();
    }
  };

  return { start, stop, withLoading };
}
