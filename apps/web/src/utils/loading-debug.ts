/**
 * 开发调试工具 - 加载动画测试
 * @description 仅用于开发环境，测试加载动画是否正常工作
 */
import { loadingManager } from '@sunny-base-web/effects';

/**
 * 在浏览器控制台中测试加载动画
 *
 * 使用方法：
 * 1. 打开浏览器控制台（F12）
 * 2. 输入：window.testLoading()
 * 3. 观察是否显示加载动画
 */
export function setupLoadingDebugTool() {
  if (import.meta.env.DEV) {
    // 暴露测试函数
    (window as any).testLoading = async (duration = 2000) => {
      console.group('[Loading Debug Tool]');
      console.log('=== 开始测试 ===');
      console.log('[Debug] LoadingManager instance:', loadingManager);
      console.log('[Debug] Current state:', {
        isLoading: loadingManager.isLoading.value,
      });

      console.log('\n[Debug] Calling startLoading()...');
      loadingManager.startLoading();

      console.log('[Debug] After startLoading():');
      console.log('  - isLoading:', loadingManager.isLoading.value);

      console.log(`\n[Debug] Waiting ${duration}ms...`);
      await new Promise(resolve => setTimeout(resolve, duration));

      console.log('[Debug] Calling stopLoading()...');
      loadingManager.stopLoading();

      console.log('[Debug] After stopLoading():');
      console.log('  - isLoading:', loadingManager.isLoading.value);
      console.log('=== 测试结束 ===');
      console.groupEnd();
    };

    // 强制停止
    (window as any).forceStopLoading = () => {
      console.log('[Loading Debug Tool] Force stopping all loading...');
      loadingManager.forceStop();
      console.log('[Loading Debug Tool] Force stop complete');
      console.log('  - isLoading:', loadingManager.isLoading.value);
    };

    console.log('[Loading Debug Tool] Ready!');
    console.log('  - window.testLoading(2000)  - 测试加载动画（持续2秒）');
    console.log('  - window.forceStopLoading() - 强制停止所有加载');
  }
}

