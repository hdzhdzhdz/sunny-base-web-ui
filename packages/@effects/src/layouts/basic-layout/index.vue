<!--
  * 基础布局组件 (BasicLayout)
  * 包含侧边栏、顶部导航栏和内容区域
  * 支持响应式折叠、主题切换、全屏等功能
-->
<template>
  <a-layout class="h-screen w-screen" ref="rootLayoutRef">
    <!-- 侧边栏区域 -->
    <a-layout-sider
      v-if="!tabbarStore.contentFullScreen"
      breakpoint="xl"
      collapsible
      :trigger="null"
      :width="config.sidebar?.width ?? 220"
      v-model:collapsed="collapsed"
      @collapse="onCollapse"
      class="h-full bg-[var(--color-bg-2)] border-r border-[var(--color-border)] flex flex-col [&>.arco-layout-sider-children]:flex [&>.arco-layout-sider-children]:flex-col [&>.arco-layout-sider-children]:overflow-hidden [&>.arco-layout-sider-children]:flex-1"
    >
      <!-- 侧边栏 Logo 区域 -->
      <div 
        class="h-16 shrink-0 flex items-center justify-center border-b border-[var(--color-border)] gap-2 overflow-hidden whitespace-nowrap" 
        v-if="config.logo?.enable"
        :style="{ height: (config.header?.height ?? 64) + 'px' }"
      >
        <!-- Logo 图片 -->
        <img 
          class="h-8 w-8"
          :src="config.logo?.source || 'https://v2.vuejs.org/images/logo.svg'" 
          :style="{ objectFit: (config.logo?.fit as any) || 'contain' }" 
          alt="Logo" 
        />
        <!-- 应用名称 (仅在展开时显示) -->
        <span v-if="!collapsed" class="text-lg font-bold text-[var(--color-text-1)]">{{ config.app?.name || 'Admin' }}</span>
      </div>
      
      <!-- 侧边栏菜单区域 (使用滚动条包裹) -->
      <KunkkaScrollbar class="flex-1 overflow-hidden">
        <a-menu
          v-model:selected-keys="selectedKeys"
          v-model:open-keys="openKeys"
          @menu-item-click="handleMenuClick"
          :style="{ width: '100%' }"
          :auto-open="true"
        >
          <!-- 递归渲染菜单项 -->
          <MenuItem :menus="accessStore.accessMenus" />
        </a-menu>
      </KunkkaScrollbar>
    </a-layout-sider>

    <!-- 右侧主体区域 -->
    <a-layout ref="innerLayoutRef">
      <!-- 顶部导航栏 -->
      <a-layout-header 
        v-if="!tabbarStore.contentFullScreen"
        class="h-16 bg-[var(--color-bg-2)] border-b border-[var(--color-border)] flex items-center px-5"
        :style="{ height: (config.header?.height ?? 64) + 'px' }"
      >
        <!-- 侧边栏折叠/展开按钮 -->
        <!-- Added text colors for better theme adaptation -->
        <div 
          class="cursor-pointer flex items-center p-1 rounded hover:bg-[var(--color-fill-3)] text-[var(--color-text-2)] hover:text-[var(--color-text-1)] transition-colors" 
          @click="toggleCollapsed"
        >
          <KunkkaIcon :icon="collapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'" :size="24" />
        </div>

        <!-- 面包屑导航 -->
        <HeaderBreadcrumb />
        
        <!-- 占位符，将右侧操作推到最右 -->
        <div style="flex: 1;"></div>
        
        <!-- 顶部右侧操作栏 -->
        <div class="header-actions flex items-center gap-4">
           <!-- 搜索组件 -->
           <HeaderSearch />
           <!-- 语言切换组件 -->
           <LanguageToggle />
           <!-- 主题切换组件 -->
           <ThemeToggle />
           <!-- 用户操作占位 -->
        </div>
      </a-layout-header>

      <!-- 内容包装器：包含标签栏和内容区域，用于全屏时仅显示此区域 -->
      <div id="layout-content-wrapper" class="flex flex-col flex-1 overflow-hidden">
        <!-- 标签栏 -->
        <Tabbar />
        
        <!-- 内容区域 -->
        <a-layout-content class="flex-1 p-2 overflow-auto bg-[var(--color-fill-2)]">
          <!-- 路由视图渲染 -->
          <router-view />
        </a-layout-content>
      </div>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAccessStore, useTabbarStore } from '@sunny-base-web/stores';
import { useRouter, useRoute } from 'vue-router';
import { KunkkaIcon, KunkkaScrollbar } from '@sunny-base-web/ui';
import { useEffectsConfig } from '../../config';
import MenuItem from './menu-item.vue';
import HeaderBreadcrumb from './header/breadcrumb.vue';
import HeaderSearch from './header/search.vue';
import ThemeToggle from './header/theme-toggle.vue';
import Tabbar from './tabbar/index.vue';
import LanguageToggle from './header/language-toggle.vue';

// 定义组件名称
defineOptions({ name: 'BasicLayout' });

// 获取全局配置 (通过 createEffects 注入)
const config = useEffectsConfig();

// 初始化 store 和 router
const accessStore = useAccessStore();
const tabbarStore = useTabbarStore();
const router = useRouter();
const route = useRoute();

// 侧边栏折叠状态
const collapsed = ref(false);

// 菜单选中和展开状态
const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>([]);

// 辅助函数：递归查找菜单项及其父级路径
const findItem = (items: any[], path: string): any => {
  for (const item of items) {
    if (item.path === path) return item;
    if (item.children) {
      const found = findItem(item.children, path);
      if (found) return found;
    }
  }
  return null;
};

// 监听路由变化，自动更新菜单选中状态和展开父级菜单
watch(
  () => route.path,
  (newPath) => {
    // 设置当前选中的菜单项
    selectedKeys.value = [newPath];
    
    // 自动展开父级菜单
    const activeItem = findItem(accessStore.accessMenus, newPath);
    if (activeItem && activeItem.parents) {
      const parents = activeItem.parents;
      parents.forEach((p: string) => {
          // 如果父级尚未展开，则添加到展开列表
          if (!openKeys.value.includes(p)) {
              openKeys.value.push(p);
          }
      });
    }
  },
  { immediate: true } // 立即执行一次以初始化状态
);

// 处理侧边栏折叠事件
const onCollapse = (val: boolean, type: string) => {
  collapsed.value = val;
};

// 手动切换折叠状态
const toggleCollapsed = () => {
  collapsed.value = !collapsed.value;
};

// 处理菜单点击跳转
const handleMenuClick = (key: string) => {
  router.push(key);
};
</script>
