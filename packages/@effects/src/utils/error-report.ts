import type { App } from 'vue';

/**
 * 错误上下文信息
 */
export interface ErrorContext {
  // 组件实例
  component?: string;
  // Vue 错误信息（errorCaptured 的 info 参数）
  info?: string;
  // 当前路由
  url?: string;
  // 用户代理
  userAgent?: string;
  // 时间戳
  timestamp?: string;
  // 其他自定义信息
  [key: string]: any;
}

/**
 * 上报错误到监控系统
 *
 * TODO: 集成 Sentry SDK
 * 1. 安装依赖: pnpm add @sentry/vue
 * 2. 在 bootstrap.ts 中初始化 Sentry:
 *    ```
 *    import * as Sentry from '@sentry/vue';
 *
 *    Sentry.init({
 *      app,
 *      dsn: import.meta.env.VITE_SENTRY_DSN,
 *      environment: import.meta.env.MODE,
 *      release: import.meta.env.VITE_APP_VERSION,
 *      integrations: [
 *        new Sentry.BrowserTracing({
 *          routingInstrumentation: Sentry.vueRouterInstrumentation(router),
 *        }),
 *        new Sentry.Replay(),
 *      ],
 *      tracesSampleRate: 1.0,
 *      replaysSessionSampleRate: 0.1,
 *      replaysOnErrorSampleRate: 1.0,
 *    });
 *    ```
 * 3. 在此函数中使用 Sentry.captureException()
 *
 * @param error - 错误对象
 * @param context - 错误上下文
 */
export function reportError(error: Error, context?: ErrorContext): void {
  // TODO: 生产环境集成 Sentry
  if (import.meta.env.PROD) {
    // Sentry 示例代码（取消注释并配置后可用）
    // import * as Sentry from '@sentry/vue';
    // Sentry.withScope((scope) => {
    //   if (context) {
    //     Object.entries(context).forEach(([key, value]) => {
    //       scope.setTag(key, value);
    //     });
    //   }
    //   Sentry.captureException(error);
    // });

    // 临时方案：打印到控制台
    console.error('[Error Report]', {
      error,
      context,
      timestamp: new Date().toISOString(),
    });
  } else {
    // 开发环境详细日志
    console.group('🔴 Error Report');
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
    console.groupEnd();
  }
}

/**
 * 上报 Promise rejection
 *
 * @param event - unhandledrejection 事件
 */
export function reportUnhandledRejection(event: PromiseRejectionEvent): void {
  const error = event.reason instanceof Error
    ? event.reason
    : new Error(String(event.reason));

  reportError(error, {
    type: 'unhandledrejection',
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 上报全局错误
 *
 * @param event - error 事件
 */
export function reportGlobalError(event: ErrorEvent): void {
  const error = event.error instanceof Error
    ? event.error
    : new Error(event.message);

  reportError(error, {
    type: 'global_error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  });
}
