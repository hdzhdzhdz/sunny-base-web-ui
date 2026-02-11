/// <reference types="vite/client" />
/// <reference types="vue/macros-global" />

/**
 * Vite 环境变量类型定义
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_TITLE?: string;
  readonly VITE_APP_MOCK_ENABLED?: string;
}

/**
 * ImportMeta 扩展
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: ViteHotContext;
}

/**
 * 静态资源模块声明
 */
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.ico' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

/**
 * Vue 组件模块声明
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

/**
 * CSS 模块声明
 */
declare module '*.css' {
  const styles: Record<string, string>;
  export default styles;
}

declare module '*.scss' {
  const styles: Record<string, string>;
  export default styles;
}

declare module '*.sass' {
  const styles: Record<string, string>;
  export default styles;
}

declare module '*.less' {
  const styles: Record<string, string>;
  export default styles;
}

/**
 * 修复 Vue 3 模板中 $slots 遍历的类型问题
 * 在模板中使用 v-for 遍历 $slots 时，TypeScript 会报循环变量隐式 any 类型错误
 */
import type { Slots } from 'vue'

declare module '@vue/runtime-core' {
  interface Slots extends Record<string, any> {}
}

