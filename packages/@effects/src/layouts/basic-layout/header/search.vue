<template>
  <div>
    <!-- 
      搜索触发按钮 
      包含搜索图标、提示文本和快捷键提示
    -->
    <div
      class="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-fill-2)] hover:bg-[var(--color-fill-3)] rounded-full cursor-pointer transition-all duration-300 border border-transparent hover:border-[var(--color-border)] hover:shadow-sm"
      @click="openSearch"
    >
      <KunkkaIcon icon="lucide:search" :size="14" class="text-[var(--color-text-3)]" />
      <span class="text-[var(--color-text-3)] text-xs">搜索...</span>
      <!-- 快捷键提示：根据操作系统显示 Cmd+K 或 Ctrl+K -->
      <span class="text-[var(--color-text-4)] text-[10px] bg-[var(--color-fill-1)] px-1.5 py-0.5 rounded-md border border-[var(--color-border)] ml-1 shadow-sm font-medium">
        {{ isMac ? '⌘ K' : 'Ctrl K' }}
      </span>
    </div>

    <!-- 
      搜索弹窗 
      自定义样式的 Modal，移除了默认的头部和底部，实现类似 Command Palette 的效果
    -->
    <a-modal
      v-model:visible="visible"
      :footer="false"
      :closable="false"
      :align-center="false"
      top="100px"
      width="520px"
      class="search-modal"
      @close="handleClose"
    >
      <div class="bg-[var(--color-bg-2)] rounded-xl shadow-2xl overflow-hidden border border-[var(--color-border)] flex flex-col max-h-[500px]">
        <!-- 顶部搜索输入框区域 -->
        <div class="relative flex items-center px-3 py-3 border-b border-[var(--color-border)] shrink-0">
          <KunkkaIcon icon="lucide:search" :size="18" class="text-[var(--color-text-3)] mr-2" />
          <input
            ref="inputRef"
            v-model="keyword"
            class="flex-1 bg-transparent border-none outline-none text-base text-[var(--color-text-1)] placeholder-[var(--color-text-4)] h-6"
            placeholder="搜索菜单..."
            @keydown="handleKeydown"
          />
          <!-- 清空按钮 / ESC 提示 -->
          <div
            v-if="keyword"
            class="cursor-pointer text-[var(--color-text-4)] hover:text-[var(--color-text-3)] transition-colors p-0.5 rounded hover:bg-[var(--color-fill-3)]"
            @click="keyword = ''"
          >
            <KunkkaIcon icon="lucide:x" :size="14" />
          </div>
          <div v-else class="text-[var(--color-text-4)] text-[10px] bg-[var(--color-fill-2)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
            ESC
          </div>
        </div>

        <!-- 
          搜索结果列表 
          使用自定义滚动条样式，支持鼠标移动侦测以处理键鼠交互冲突
        -->
        <div class="overflow-y-auto custom-scrollbar p-1.5 flex-1" ref="listRef" @mousemove="handleMouseMove">
          <!-- 有搜索结果时显示列表 -->
          <template v-if="filteredMenus.length > 0">
            <div class="text-[10px] text-[var(--color-text-4)] px-2 py-1.5 font-medium">应用菜单</div>
            <div
              v-for="(item, index) in filteredMenus"
              :key="item.path"
              :ref="(el) => { if (el) itemRefs[index] = el as HTMLElement }"
              class="flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer mb-0.5 group border border-transparent"
              :class="{
                'bg-[rgb(var(--primary-6))] shadow-sm border-transparent': activeIndex === index,
                'hover:bg-[var(--color-fill-2)] text-[var(--color-text-1)]': activeIndex !== index
              }"
              @click="handleSelect(item)"
              @mouseenter="isMouseNav && (activeIndex = index)"
            >
              <!-- 菜单项左侧：图标和标题 -->
              <div class="flex items-center gap-2.5 overflow-hidden flex-1">
                <!-- 图标容器 -->
                <div 
                  class="flex items-center justify-center w-7 h-7 rounded shrink-0"
                  :class="activeIndex === index ? 'bg-white/20 text-white' : 'bg-[var(--color-fill-3)] text-[var(--color-text-3)] group-hover:bg-[var(--color-fill-4)] group-hover:text-[var(--color-text-2)]'"
                >
                  <KunkkaIcon
                    :icon="item.icon || 'lucide:layout-grid'"
                    :size="14"
                  />
                </div>
                
                <!-- 文本信息：标题和面包屑路径 -->
                <div class="flex flex-col overflow-hidden flex-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="truncate font-medium text-sm leading-none"
                      :class="activeIndex === index ? 'text-white' : 'text-[var(--color-text-1)]'"
                    >
                      {{ item.title }}
                    </span>
                  </div>
                  <!-- 面包屑路径展示 -->
                  <div 
                    class="flex items-center text-[10px] mt-1 truncate leading-none"
                    :class="activeIndex === index ? 'text-white/70' : 'text-[var(--color-text-3)]'"
                  >
                    <span v-for="(parent, pIndex) in item.parentNames" :key="pIndex" class="flex items-center">
                      {{ parent }}
                      <KunkkaIcon icon="lucide:chevron-right" :size="10" class="mx-0.5 opacity-60" />
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 选中时的回车图标提示 -->
              <div 
                class="transition-opacity duration-200"
                :class="activeIndex === index ? 'opacity-100' : 'opacity-0'"
              >
                <KunkkaIcon
                  icon="lucide:corner-down-left"
                  :size="14"
                  class="text-white"
                />
              </div>
            </div>
          </template>
          
          <!-- 搜索无结果状态 -->
          <div v-else-if="keyword" class="py-12 text-center text-[var(--color-text-3)] flex flex-col items-center justify-center">
            <div class="w-12 h-12 bg-[var(--color-fill-2)] rounded-full flex items-center justify-center mb-3">
               <KunkkaIcon icon="lucide:search-x" :size="24" class="opacity-50" />
            </div>
            <p class="text-sm font-medium mb-0.5">未找到结果</p>
            <p class="text-[10px] opacity-70">尝试搜索其他关键词</p>
          </div>
          
          <!-- 初始空状态 -->
          <div v-else class="py-10 text-center">
            <div class="flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
               <KunkkaIcon icon="lucide:command" :size="40" class="mb-3 text-[var(--color-text-4)]" />
               <p class="text-[var(--color-text-3)] text-xs mb-1 font-medium">
                 输入关键词搜索菜单
               </p>
            </div>
          </div>
        </div>
        
        <!-- 底部快捷键提示栏 -->
        <div class="py-1.5 px-3 border-t border-[var(--color-border)] bg-[var(--color-fill-1)] flex justify-between text-[10px] text-[var(--color-text-3)] shrink-0">
           <div class="flex gap-3">
             <span class="flex items-center gap-1"><kbd class="font-mono bg-[var(--color-fill-3)] px-1 py-0 rounded border border-[var(--color-border)] shadow-sm min-w-[16px] text-center inline-block">↵</kbd> <span>选择</span></span>
             <span class="flex items-center gap-1"><kbd class="font-mono bg-[var(--color-fill-3)] px-1 py-0 rounded border border-[var(--color-border)] shadow-sm min-w-[16px] text-center inline-block">↑↓</kbd> <span>导航</span></span>
           </div>
           <div>
             <span class="flex items-center gap-1"><kbd class="font-mono bg-[var(--color-fill-3)] px-1 py-0 rounded border border-[var(--color-border)] shadow-sm min-w-[20px] text-center inline-block">Esc</kbd> <span>关闭</span></span>
           </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAccessStore } from '@sunny-base-web/stores';
import { KunkkaIcon } from '@kunkka/ui';

defineOptions({ name: 'HeaderSearch' });

/** 
 * 搜索项接口定义 
 */
interface SearchItem {
  title: string;       // 菜单标题
  path: string;        // 路由路径
  icon?: string;       // 菜单图标
  parentNames: string[]; // 父级菜单名称列表（用于面包屑展示）
}

// 核心依赖
const router = useRouter();
const accessStore = useAccessStore();

// 状态控制
const visible = ref(false); // 弹窗显示状态
const keyword = ref('');    // 搜索关键词

// DOM 引用
const inputRef = ref<HTMLInputElement>();
const listRef = ref<HTMLElement>();
const itemRefs = ref<HTMLElement[]>([]);

// 交互状态
const activeIndex = ref(0);   // 当前选中的索引
const isMouseNav = ref(true); // 是否允许鼠标导航（解决键盘滚动时鼠标误触发的问题）

// 环境判断
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

/**
 * 递归展平菜单树
 * 将嵌套的路由结构展平为一维数组，便于搜索过滤
 * @param menus 菜单列表
 * @param parents 父级名称累积数组
 */
const flattenMenus = (menus: any[], parents: string[] = []): SearchItem[] => {
  let result: SearchItem[] = [];
  
  for (const menu of menus) {
    const currentTitle = menu.meta?.title || menu.title || menu.name;
    const currentParents = [...parents];
    
    // 如果是叶子节点，或者虽然有子节点但被配置为隐藏子菜单，则视为可搜索项
    if (!menu.children || menu.children.length === 0 || menu.meta?.hideChildrenInMenu) {
       result.push({
         title: currentTitle,
         path: menu.path,
         icon: menu.icon || menu.meta?.icon,
         parentNames: currentParents
       });
    }
    
    // 如果有子菜单且未隐藏，递归处理
    if (menu.children && menu.children.length > 0 && !menu.meta?.hideChildrenInMenu) {
      result = [
        ...result, 
        ...flattenMenus(menu.children, [...currentParents, currentTitle])
      ];
    }
  }
  return result;
};

// 计算所有可搜索的菜单项
const allMenus = computed(() => flattenMenus(accessStore.accessMenus));

// 根据关键词过滤菜单
const filteredMenus = computed(() => {
  if (!keyword.value) return [];
  const lowerKeyword = keyword.value.toLowerCase();
  return allMenus.value.filter(item => 
    item.title.toLowerCase().includes(lowerKeyword) || 
    item.path.toLowerCase().includes(lowerKeyword)
  );
});

// 监听关键词变化，重置选中项
watch(keyword, () => {
  activeIndex.value = 0;
});

// 鼠标位置追踪，用于解决键盘滚动时的鼠标干扰
let lastMouseX = -1;
let lastMouseY = -1;

/**
 * 处理鼠标移动事件
 * 只有当鼠标真实移动时才启用鼠标导航
 * 避免列表滚动导致元素移动到鼠标下方时意外触发 hover 效果
 */
const handleMouseMove = (e: MouseEvent) => {
  // 初始化记录
  if (lastMouseX === -1 && lastMouseY === -1) {
    lastMouseX = e.screenX;
    lastMouseY = e.screenY;
    return;
  }
  // 检查坐标是否真实变化
  if (e.screenX !== lastMouseX || e.screenY !== lastMouseY) {
    isMouseNav.value = true;
    lastMouseX = e.screenX;
    lastMouseY = e.screenY;
  }
};

/**
 * 打开搜索弹窗
 */
const openSearch = () => {
  visible.value = true;
  keyword.value = '';
  // 弹窗打开后自动聚焦输入框
  nextTick(() => {
    inputRef.value?.focus();
  });
};

/**
 * 关闭搜索弹窗处理
 */
const handleClose = () => {
  keyword.value = '';
};

/**
 * 选择菜单项并跳转
 */
const handleSelect = (item: SearchItem) => {
  router.push(item.path);
  visible.value = false;
};

/**
 * 处理列表键盘导航 (上下键、回车)
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (filteredMenus.value.length === 0) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      isMouseNav.value = false; // 禁用鼠标导航，防止冲突
      activeIndex.value = (activeIndex.value + 1) % filteredMenus.value.length;
      scrollActiveIntoView();
      break;
      
    case 'ArrowUp':
      e.preventDefault();
      isMouseNav.value = false; // 禁用鼠标导航
      activeIndex.value = (activeIndex.value - 1 + filteredMenus.value.length) % filteredMenus.value.length;
      scrollActiveIntoView();
      break;
      
    case 'Enter':
      e.preventDefault();
      if (filteredMenus.value.length > 0) {
        handleSelect(filteredMenus.value[activeIndex.value]);
      }
      break;
  }
};

/**
 * 将当前选中的项滚动到可视区域
 */
const scrollActiveIntoView = () => {
  if (activeIndex.value >= 0 && itemRefs.value[activeIndex.value]) {
    const el = itemRefs.value[activeIndex.value];
    // 使用 'nearest' 确保只在需要时滚动，且保持最小滚动距离
    el.scrollIntoView({ block: 'nearest' });
  }
};

/**
 * 全局快捷键监听 (Cmd/Ctrl + K)
 */
const handleGlobalKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (!visible.value) {
      openSearch();
    } else {
      visible.value = false;
    }
  }
};

// 生命周期钩子：绑定和解绑全局事件
onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<style>
/* 
  重写 Arco Modal 样式以适应搜索框需求
  去除默认的边框、背景、阴影，使其看起来像一个悬浮的 Command Palette
*/
.search-modal .arco-modal {
  border-radius: 12px;
  overflow: hidden;
  padding: 0;
  background-color: transparent;
  box-shadow: none;
}
.search-modal .arco-modal-header,
.search-modal .arco-modal-footer {
  display: none;
}
.search-modal .arco-modal-content {
  padding: 0;
  background-color: transparent;
  box-shadow: none;
  border: none;
}

/* 自定义滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--color-fill-3);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>