import { computed } from 'vue';
import { useBreakpoints } from '@vueuse/core';
import type { ColProps, FormRenderProps } from '../types';

/**
 * 响应式 Span 计算 hook
 * Reactive Span calculation hook
 */
export function useResponsiveState(props: FormRenderProps) {
  // Arco Design Breakpoints
  // xs < 576px
  // sm >= 576px
  // md >= 768px
  // lg >= 992px
  // xl >= 1200px
  // xxl >= 1600px
  const arcoBreakpoints = {
    xs: 576,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
  };
  
  const breakpoints = useBreakpoints(arcoBreakpoints);

  const spans = computed(() => {
    const map: Record<string, number> = {};
    const schema = props.schema || [];
    
    // 当前激活的断点 (从大到小检查)
    const activeBreakpoint = getActiveBreakpoint();
    
    // 获取全局默认 colProps
    const globalColProps = props.commonConfig?.colProps;

    schema.forEach((item) => {
      if (!item.fieldName) return;
      // Item 配置优先，如果没有则使用全局配置
      const finalColProps = item.colProps || globalColProps;
      map[item.fieldName] = resolveSpan(finalColProps, item.colSpan, activeBreakpoint);
    });
    
    return map;
  });

  const actionSpan = computed(() => {
    const activeBreakpoint = getActiveBreakpoint();
    
    if (props.layout === 'inline') {
      return undefined;
    }

    // 1. 如果用户提供了 actionColProps，优先使用
    if (props.actionColProps) {
      return resolveSpan(props.actionColProps, undefined, activeBreakpoint);
    }

    // 2. 如果开启了折叠功能，且未单独配置 actionColProps
    if (props.showCollapseButton) {
      // 2.1 尝试使用全局 commonConfig 中的 colProps
      const globalColProps = props.commonConfig?.colProps;
      if (globalColProps) {
        return resolveSpan(globalColProps, undefined, activeBreakpoint);
      }

       // 2.2 都没有配置，使用默认的响应式配置: { xs: 12, sm: 12, md: 8, lg: 6 }
       const defaultColProps = { xs: 12, sm: 12, md: 8, lg: 6 };
       return resolveSpan(defaultColProps, undefined, activeBreakpoint);
    }

    // 3. 默认独占一行
    return 24;
  });

  function getActiveBreakpoint() {
    if (breakpoints.greaterOrEqual('xxl').value) return 'xxl';
    if (breakpoints.greaterOrEqual('xl').value) return 'xl';
    if (breakpoints.greaterOrEqual('lg').value) return 'lg';
    if (breakpoints.greaterOrEqual('md').value) return 'md';
    if (breakpoints.greaterOrEqual('sm').value) return 'sm';
    return 'xs';
  }

  function resolveSpan(
    colProps: ColProps | undefined, 
    colSpan: number | undefined, 
    bp: string
  ): number {
    // 1. 如果有 colProps，尝试解析响应式配置
    if (colProps) {
       // 级联检查: xxl -> xl -> lg -> md -> sm -> xs
       // Arco/Antd 逻辑: 如果定义了 md=8，则 md及以上都是8，除非 lg 定义了别的值
       
       const bps = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
       const bpIndex = bps.indexOf(bp);
       
       // 从当前断点开始向下查找定义
       // 例如当前是 lg (index 2)
       // 检查 lg -> md -> sm -> xs
       // 只要找到一个定义的，就使用它
       for (let i = bpIndex; i < bps.length; i++) {
         const key = bps[i];
         const val = colProps[key];
         if (val !== undefined) {
           return typeof val === 'object' ? (val.span ?? 24) : val;
         }
       }
       
       // 如果 colProps 中有 span 属性 (默认)
       if (colProps.span !== undefined) {
         return colProps.span;
       }
    }

    // 2. 使用 colSpan
    if (colSpan !== undefined) {
      return colSpan;
    }

    // 3. 默认值
    return 24;
  }

  return { spans, actionSpan };
}
