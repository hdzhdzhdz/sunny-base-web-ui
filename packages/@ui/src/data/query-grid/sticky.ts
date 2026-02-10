import { onBeforeUnmount, onMounted, type Ref, watch } from 'vue';
import type { VxeGridInstance } from 'vxe-table';

export function useSticky(gridRef: Ref<VxeGridInstance | undefined>, props: Record<string, any>) {
  let headerElement: HTMLElement | null = null;
  let placeholderElement: HTMLElement | null = null;
  
  // 底部吸附滚动条相关变量
  let bodyWrapperElement: HTMLElement | null = null;
  let stickyBarElement: HTMLElement | null = null;
  let stickyBarContentElement: HTMLElement | null = null;
  let isScrollingTable = false;
  let isScrollingBar = false;

  // 获取滚动父容器
  const getScrollParent = (node: HTMLElement): HTMLElement | Window => {
    if (!node) return window;
    let parent = node.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (/(auto|scroll)/.test(style.overflow + style.overflowY + style.overflowX)) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return window;
  };

  const removeSticky = () => {
    // 移除表头吸附
    if (headerElement && headerElement.classList.contains('is-sticky')) {
      headerElement.style.position = '';
      headerElement.style.top = '';
      headerElement.style.left = '';
      headerElement.style.zIndex = '';
      headerElement.style.width = '';
      headerElement.classList.remove('is-sticky');
      
      if (placeholderElement && placeholderElement.parentNode) {
        placeholderElement.parentNode.removeChild(placeholderElement);
        placeholderElement = null;
      }
    }
    // 移除底部滚动条
    if (stickyBarElement) {
      stickyBarElement.style.display = 'none';
    }
  }

  // 同步滚动位置：表格 -> 滚动条
  const onTableScroll = () => {
    if (isScrollingBar) return;
    if (stickyBarElement && bodyWrapperElement) {
      isScrollingTable = true;
      stickyBarElement.scrollLeft = bodyWrapperElement.scrollLeft;
      requestAnimationFrame(() => {
        isScrollingTable = false;
      });
    }
  };

  // 同步滚动位置：滚动条 -> 表格
  const onBarScroll = () => {
    if (isScrollingTable) return;
    if (stickyBarElement && bodyWrapperElement) {
      isScrollingBar = true;
      bodyWrapperElement.scrollLeft = stickyBarElement.scrollLeft;
      requestAnimationFrame(() => {
        isScrollingBar = false;
      });
    }
  };

  const initStickyBar = () => {
    if (!gridRef.value || stickyBarElement) return;
    
    // 创建吸附滚动条容器
    stickyBarElement = document.createElement('div');
    stickyBarElement.className = 'vxe-table--sticky-scrollbar';
    stickyBarElement.style.position = 'fixed';
    stickyBarElement.style.bottom = '0';
    stickyBarElement.style.overflowX = 'auto';
    stickyBarElement.style.overflowY = 'hidden';
    stickyBarElement.style.zIndex = '101'; // 比表头稍微高一点或低一点，视需求而定，通常表头重要
    stickyBarElement.style.display = 'none';
    
    // 创建内容撑开宽度
    stickyBarContentElement = document.createElement('div');
    stickyBarElement.appendChild(stickyBarContentElement);
    
    // 添加滚动监听
    stickyBarElement.addEventListener('scroll', onBarScroll);
    
    // 挂载到 body 以避免父级 overflow 影响 fixed 定位
    document.body.appendChild(stickyBarElement);
    
    // 监听表格 body 滚动
    bodyWrapperElement = gridRef.value.$el.querySelector('.vxe-table--body-wrapper');
    if (bodyWrapperElement) {
      bodyWrapperElement.addEventListener('scroll', onTableScroll);
    }
  };

  const handleScroll = () => {
    if (!gridRef.value || !headerElement) return;

    if (!props.sticky) {
      removeSticky();
      return;
    }

    const tableEl = gridRef.value.$el;
    const rect = tableEl.getBoundingClientRect();
    const headerRect = headerElement.getBoundingClientRect();
    
    // --- 表头吸附逻辑 ---
    
    const scrollParent = getScrollParent(tableEl);
    let parentRect = { top: 0, bottom: window.innerHeight, left: 0 };
    if (scrollParent !== window && scrollParent instanceof HTMLElement) {
      parentRect = scrollParent.getBoundingClientRect();
    }
    
    // 只有当父容器可见时才进行吸附判断
    const isParentVisible = parentRect.bottom > 0 && parentRect.top < window.innerHeight;
    
    if (isParentVisible && rect.top < parentRect.top && rect.bottom > headerRect.height) {
        // 计算目标 top 值：父容器 top 和 0 取最大值 (防止父容器顶部滚出视口时表头也跟着滚出去，除非是为了贴合父容器顶部)
        // 用户要求：当表头在父容器不可见时吸附在父容器的顶部
        const targetTop = Math.max(0, parentRect.top);
        
        // 确保不超出表格底部 (预留表头高度)
        if (rect.bottom - headerRect.height > targetTop) {
            if (!headerElement.classList.contains('is-sticky') || 
                headerElement.style.top !== `${targetTop}px` ||
                headerElement.style.left !== `${rect.left}px`) {
                
                headerElement.style.position = 'fixed';
                headerElement.style.top = `${targetTop}px`;
                headerElement.style.left = `${rect.left}px`;
                headerElement.style.width = `${rect.width}px`;
                headerElement.style.zIndex = '100';
                headerElement.classList.add('is-sticky');
                
                // 占位
                if (!placeholderElement) {
                    placeholderElement = document.createElement('div');
                    headerElement.parentNode?.insertBefore(placeholderElement, headerElement);
                }
                placeholderElement.style.height = `${headerRect.height}px`;
            }
        } else {
            // 接近底部时，取消吸附或保持在底部边缘（这里简单处理为取消，或者可以让它停在底部）
            // 现有逻辑是取消
             removeSticky();
        }
    } else {
        // 表头不需要吸附
        if (headerElement.classList.contains('is-sticky')) {
             headerElement.style.position = '';
             headerElement.style.top = '';
             headerElement.style.left = '';
             headerElement.style.width = '';
             headerElement.classList.remove('is-sticky');
             if (placeholderElement && placeholderElement.parentNode) {
                 placeholderElement.parentNode.removeChild(placeholderElement);
                 placeholderElement = null;
             }
        }
    }

    // --- 底部横向滚动条吸附逻辑 ---
    if (!stickyBarElement || !bodyWrapperElement) {
        initStickyBar();
    }
    
    if (stickyBarElement && bodyWrapperElement && stickyBarContentElement) {
        const scrollWidth = bodyWrapperElement.scrollWidth;
        const clientWidth = bodyWrapperElement.clientWidth;
        
        // 只有当有横向滚动条时才显示
        if (scrollWidth > clientWidth) {
            const viewportHeight = window.innerHeight;
            // 表格底部在视口下方，且表格顶部在视口上方（即表格占据了底部边缘）
            // 或者更精确：表格可视区域包含了视口底部
            // 逻辑：表格 bottom > viewportHeight 且 表格 top < viewportHeight
            if (rect.bottom > viewportHeight && rect.top < viewportHeight) {
                stickyBarElement.style.display = 'block';
                stickyBarElement.style.width = `${rect.width}px`;
                stickyBarElement.style.left = `${rect.left}px`;
                stickyBarContentElement.style.width = `${scrollWidth}px`;
                
                // 同步滚动位置（如果是首次显示或位置偏差）
                if (Math.abs(stickyBarElement.scrollLeft - bodyWrapperElement.scrollLeft) > 1) {
                     stickyBarElement.scrollLeft = bodyWrapperElement.scrollLeft;
                }
            } else {
                stickyBarElement.style.display = 'none';
            }
        } else {
            stickyBarElement.style.display = 'none';
        }
    }
  };

  watch(() => props.sticky, () => {
    handleScroll();
  });

  onMounted(() => {
    // 延迟获取 DOM，确保 vxe-table 已经渲染
    setTimeout(() => {
      if (gridRef.value) {
        // 获取表头元素
        headerElement = gridRef.value.$el.querySelector('.vxe-table--header-wrapper');
        
        if (headerElement) {
          // 监听 window 滚动（处理 fixed 定位）
          window.addEventListener('scroll', handleScroll, true);
          // 监听 resize 以调整宽度
          window.addEventListener('resize', handleScroll);
        }
        
        initStickyBar();
      }
    }, 100);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll, true);
    window.removeEventListener('resize', handleScroll);
    if (placeholderElement && placeholderElement.parentNode) {
      placeholderElement.parentNode.removeChild(placeholderElement);
    }
    
    if (stickyBarElement && stickyBarElement.parentNode) {
        stickyBarElement.parentNode.removeChild(stickyBarElement);
    }
    
    if (bodyWrapperElement) {
        bodyWrapperElement.removeEventListener('scroll', onTableScroll);
    }
  });
}
