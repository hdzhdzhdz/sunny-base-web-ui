<!--
  * 标签栏组件
  * 显示当前打开的页面标签，支持右键菜单
-->
<template>
  <div class="flex items-center w-full h-[38px] bg-[var(--color-bg-2)] border-b border-[var(--color-border)] px-2 gap-2">
    <!-- 标签滚动区域 -->
    <div class="flex-1 overflow-hidden h-full flex items-center">
      <SunnyScrollbar horizontal class="w-full h-full flex items-center" :style="{ display: 'flex', alignItems: 'center' }">
        <div class="flex items-center gap-1 h-full px-1 pb-1">
          <div
            v-for="tab in tabbarStore.getTabs"
            :key="tab.key"
            class="flex items-center"
          >
            <a-dropdown
              trigger="contextMenu"
              @select="(val: any) => handleContextMenuSelect(val, tab)"
            >
              <div
                class="group relative flex items-center gap-2 px-3 py-1 text-sm rounded-sm cursor-pointer transition-all duration-200 border whitespace-nowrap"
                :class="[
                  isActive(tab) 
                    ? 'bg-[rgb(var(--primary-6))] text-white border-[rgb(var(--primary-6))] dark:bg-[var(--color-bg-1)] dark:text-[rgb(var(--primary-6))]' 
                    : 'bg-[var(--color-bg-1)] text-[var(--color-text-2)] border-[var(--color-border)] hover:text-[var(--color-text-1)] hover:border-[var(--color-border-3)]'
                ]"
                @click="handleTabClick(tab)"
              >
                <span>{{ tab.meta?.title || tab.name }}</span>
                
                <!-- 固定图标 -->
                <span 
                  v-if="tab.meta?.affixTab"
                  class="flex items-center justify-center w-4 h-4 rounded-full transition-colors"
                  :class="[
                    isActive(tab) 
                      ? 'hover:bg-[rgba(255,255,255,0.2)] dark:hover:bg-[var(--color-fill-3)]' 
                      : 'hover:bg-[var(--color-fill-3)]'
                  ]"
                  @click.stop="tabbarStore.toggleTabPin(tab)"
                  title="取消固定"
                >
                  <SunnyIcon icon="lucide:pin" :size="12" />
                </span>

                <!-- 关闭按钮 -->
                <span 
                  v-else
                  class="flex items-center justify-center w-4 h-4 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  :class="[
                    isActive(tab) 
                      ? 'hover:bg-[rgba(255,255,255,0.2)] dark:hover:bg-[var(--color-fill-3)]' 
                      : 'hover:bg-[var(--color-fill-3)]'
                  ]"
                  @click.stop="handleClose(tab)"
                >
                  <SunnyIcon icon="lucide:x" :size="12" />
                </span>
              </div>
              <template #content>
                <template v-for="item in getContextMenuItems(tab)" :key="item.key">
                  <a-doption v-if="!item.separator" :value="item.key" :disabled="item.disabled">
                    <template #icon v-if="item.icon"><SunnyIcon :icon="item.icon" /></template>
                    {{ item.text }}
                  </a-doption>
                  <a-doption v-else :value="item.key" :disabled="item.disabled" class="border-t border-[var(--color-border)] mt-1 pt-1">
                    <template #icon v-if="item.icon"><SunnyIcon :icon="item.icon" /></template>
                    {{ item.text }}
                  </a-doption>
                </template>
              </template>
            </a-dropdown>
          </div>
        </div>
      </SunnyScrollbar>
    </div>

    <!-- 右侧操作栏 -->
    <div class="flex items-center gap-1 shrink-0 h-full border-l border-[var(--color-border)] pl-2 bg-[var(--color-bg-2)]">
      <!-- 下拉菜单 -->
      <a-dropdown trigger="click" @select="handleMenuSelect">
        <div class="flex items-center justify-center w-8 h-8 rounded-sm hover:bg-[var(--color-fill-3)] cursor-pointer text-[var(--color-text-2)] hover:text-[var(--color-text-1)] transition-colors">
          <SunnyIcon icon="lucide:chevron-down" :size="16" />
        </div>
        <template #content>
          <a-doption value="reload">
            <template #icon><SunnyIcon icon="lucide:rotate-cw" /></template>
            重新加载
          </a-doption>
          <a-doption value="close-current">
            <template #icon><SunnyIcon icon="lucide:x" /></template>
            关闭当前
          </a-doption>
          <a-doption value="close-other">
            <template #icon><SunnyIcon icon="lucide:minus-circle" /></template>
            关闭其他
          </a-doption>
          <a-doption value="close-all">
            <template #icon><SunnyIcon icon="lucide:trash-2" /></template>
            关闭全部
          </a-doption>
        </template>
      </a-dropdown>

      <!-- 全屏按钮 -->
      <div 
        class="flex items-center justify-center w-8 h-8 rounded-sm hover:bg-[var(--color-fill-3)] cursor-pointer text-[var(--color-text-2)] hover:text-[var(--color-text-1)] transition-colors"
        @click="toggleContentFullScreen"
      >
        <SunnyIcon :icon="tabbarStore.contentFullScreen ? 'lucide:minimize' : 'lucide:maximize'" :size="16" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useTabbarStore, useAccessStore } from '@sunny-base-web/stores';
import { useRouter, useRoute } from 'vue-router';
import { SunnyIcon, SunnyScrollbar } from '@sunny-base-web/ui';
import type { TabDefinition } from '@sunny-base-web/stores';

defineOptions({ name: 'Tabbar' });

const tabbarStore = useTabbarStore();
const accessStore = useAccessStore();
const router = useRouter();
const route = useRoute();

/**
 * 切换内容区域全屏
 */
const toggleContentFullScreen = () => {
  tabbarStore.toggleContentFullScreen();
};

/**
 * 判断标签页是否处于激活状态
 */
const isActive = (tab: TabDefinition) => {
  return tab.path === route.path;
};

/**
 * 点击标签跳转路由
 */
const handleTabClick = (tab: TabDefinition) => {
  router.push(tab.path);
};

/**
 * 关闭标签页
 */
const handleClose = async (tab: TabDefinition) => {
  await tabbarStore.closeTab(tab, router);
};

/**
 * 获取Tab的禁用状态配置
 * 用于控制右键菜单项的启用/禁用
 */
const getTabDisableState = (tab: TabDefinition) => {
  const tabs = tabbarStore.getTabs;
  const isAffix = tab.meta?.affixTab;
  
  return {
    disabledCloseCurrent: isAffix, // 固定标签不可关闭
    disabledCloseOther: tabs.length <= 1 || (tabs.length === 2 && tabs.every(t => t.meta?.affixTab || t.key === tab.key)), // 只有一个标签或只剩固定标签时不可关闭其他
    disabledCloseAll: tabs.every(t => t.meta?.affixTab), // 全部是固定标签时不可关闭全部
    disabledRefresh: false, // 刷新永远可用
  };
};

interface ContextMenuItem {
  key: string;
  text: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
}

/**
 * 获取右键上下文菜单项列表
 */
const getContextMenuItems = (tab: TabDefinition): ContextMenuItem[] => {
  const {
    disabledCloseCurrent,
    disabledRefresh,
  } = getTabDisableState(tab);

  const affixTab = tab?.meta?.affixTab ?? false;

  return [
    {
      key: 'reload',
      text: '重新加载',
      icon: 'lucide:rotate-cw',
      disabled: disabledRefresh,
    },
    {
      key: 'close-current',
      text: '关闭当前',
      icon: 'lucide:x',
      disabled: disabledCloseCurrent,
    },
    {
      key: 'affix',
      text: affixTab ? '取消固定' : '固定当前',
      icon: affixTab ? 'lucide:pin-off' : 'lucide:pin',
    },
    {
      key: 'maximize',
      text: tabbarStore.contentFullScreen ? '退出最大化' : '最大化',
      icon: tabbarStore.contentFullScreen ? 'lucide:minimize' : 'lucide:maximize',
    },
  ];
};

/**
 * 处理右键菜单项的选择事件
 */
const handleContextMenuSelect = async (val: string | number | Record<string, any>, tab: TabDefinition) => {
  switch (val) {
    case 'reload':
      if (tab.path === route.path) {
        await tabbarStore.refresh(router);
      }
      break;
    case 'close-current':
      await tabbarStore.closeTab(tab, router);
      break;
    case 'affix':
      await tabbarStore.toggleTabPin(tab);
      break;
    case 'maximize':
      // 如果操作的不是当前激活的标签，先跳转
      if (tab.path !== route.path) {
        await router.push(tab.path);
      }
      toggleContentFullScreen();
      break;
    case 'close-other':
      await tabbarStore.closeOtherTabs(tab);
      break;
    case 'close-all':
      await tabbarStore.closeAllTabs(router);
      break;
  }
};

/**
 * 处理顶部右侧下拉菜单的选择事件
 * 复用 handleContextMenuSelect 的逻辑
 */
const handleMenuSelect = async (val: string | number | Record<string, any>) => {
  const currentTab = tabbarStore.getTabs.find(tab => tab.path === route.path);
  if (!currentTab) return;
  
  handleContextMenuSelect(val, currentTab);
};

/**
 * 初始化固定标签页
 * 从路由配置中筛选出需要固定的标签
 */
const initAffixTabs = () => {
  const affixTabs = router.getRoutes().filter((route) => {
    return !!route.meta?.affixTab;
  });
  tabbarStore.setAffixTabs(affixTabs);
};

// 监听路由变化，动态添加标签页
watch(
  () => route.fullPath,
  () => {
    const meta = route.matched?.[route.matched.length - 1]?.meta;
    tabbarStore.addTab({
      ...route,
      meta: meta || route.meta,
    });
  },
  { immediate: true },
);

// 监听权限菜单变化，重新初始化固定标签页
watch(
  () => accessStore.accessMenus,
  () => {
    initAffixTabs();
  },
  { immediate: true },
);
</script>

<style scoped>
/* 隐藏滚动条样式 */
:deep(.sunny-scrollbar__bar) {
  opacity: 0;
  transition: opacity 0.3s;
}
:deep(.sunny-scrollbar:hover .sunny-scrollbar__bar) {
  opacity: 1;
}
</style>