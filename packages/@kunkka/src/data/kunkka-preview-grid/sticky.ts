import { onBeforeUnmount, onMounted, type Ref } from 'vue';
import type { VxeGridInstance } from 'vxe-table';

export function useSticky(gridRef: Ref<VxeGridInstance | undefined>) {
  let observer: IntersectionObserver | null = null;
  let headerElement: HTMLElement | null = null;
  let placeholderElement: HTMLElement | null = null;

  const handleScroll = () => {
    if (!gridRef.value || !headerElement) return;

    const rect = gridRef.value.$el.getBoundingClientRect();
    const headerRect = headerElement.getBoundingClientRect();
    
    // 当表格顶部滚动出视口时
    if (rect.top < 0 && rect.bottom > headerRect.height) {
      if (!headerElement.classList.contains('is-sticky')) {
        // 获取表格宽度
        const tableWidth = rect.width;
        
        headerElement.style.position = 'fixed';
        headerElement.style.top = '0';
        headerElement.style.zIndex = '100';
        headerElement.style.width = `${tableWidth}px`;
        headerElement.classList.add('is-sticky');
        
        // 创建占位元素防止表格内容跳动
        if (!placeholderElement) {
          placeholderElement = document.createElement('div');
          placeholderElement.style.height = `${headerRect.height}px`;
          headerElement.parentNode?.insertBefore(placeholderElement, headerElement);
        }
      }
    } else {
      if (headerElement.classList.contains('is-sticky')) {
        headerElement.style.position = '';
        headerElement.style.top = '';
        headerElement.style.zIndex = '';
        headerElement.style.width = '';
        headerElement.classList.remove('is-sticky');
        
        if (placeholderElement && placeholderElement.parentNode) {
          placeholderElement.parentNode.removeChild(placeholderElement);
          placeholderElement = null;
        }
      }
    }
  };

  onMounted(() => {
    // 延迟获取 DOM，确保 vxe-table 已经渲染
    setTimeout(() => {
      if (gridRef.value) {
        // 获取表头元素
        headerElement = gridRef.value.$el.querySelector('.vxe-table--header-wrapper');
        
        if (headerElement) {
          window.addEventListener('scroll', handleScroll, true);
        }
      }
    }, 100);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll, true);
    if (placeholderElement && placeholderElement.parentNode) {
      placeholderElement.parentNode.removeChild(placeholderElement);
    }
  });
}
