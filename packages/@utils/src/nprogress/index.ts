import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// 创建NProgress实例的变量
let nProgressInstance: typeof NProgress | null = null;

/**
 * 获取或初始化NProgress实例，并进行配置。
 * 此函数首先检查是否已经加载过NProgress库，如果已经加载过，则直接返回NProgress实例。
 * 否则，进行配置，然后返回NProgress实例。
 *
 * @returns  NProgress实例。
 */
function getNprogress() {
  if (nProgressInstance) {
    return nProgressInstance;
  }
  // NProgress 本身就是一个可配置的对象
  nProgressInstance = NProgress;
  nProgressInstance.configure({
    showSpinner: true,
    speed: 300,
  });
  return nProgressInstance;
}

/**
 * 开始显示进度条。
 * 此函数首先获取NProgress实例，然后调用NProgress的start方法开始显示进度条。
 */
function startProgress() {
  const nprogress = getNprogress();
  nprogress?.start();
}

/**
 * 停止显示进度条，并隐藏进度条。
 * 此函数首先获取NProgress实例，然后调用NProgress的done方法停止并隐藏进度条。
 */
function stopProgress() {
  const nprogress = getNprogress();
  nprogress?.done();
}

export { startProgress, stopProgress };
