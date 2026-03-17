/**
 * 加载动画模块
 * @description 提供全局加载动画的状态管理、编程式控制和全局组件
 */

export type { GlobalLoadingProps } from './types';
export { loadingManager, LoadingManager } from './loading-manager';
export { useGlobalLoading, type UseGlobalLoadingReturn } from './use-global-loading';
export { default as GlobalLoading } from './GlobalLoading.vue';
