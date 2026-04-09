<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'
import Content from './components/Content.vue'
import type { SunnyMaskProps, MaskMenu, MaskTab } from './types'

defineOptions({
  name: 'SunnyMask',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SunnyMaskProps>(), {
  menus: () => [],
  actions: () => [],
  tabs: () => [],
  collapsed: false,
  theme: 'light',
})

const emit = defineEmits<{
  (e: 'update:collapsed', value: boolean): void
  (e: 'update:activeTab', key: string): void
  (e: 'menuClick', menu: MaskMenu): void
  (e: 'tabClick', tab: MaskTab): void
  (e: 'tabClose', key: string): void
}>()

const innerCollapsed = ref(props.collapsed)

const handleCollapsedChange = (val: boolean) => {
  innerCollapsed.value = val
  emit('update:collapsed', val)
}

const handleMenuClick = (menu: MaskMenu) => {
  emit('menuClick', menu)
}

const handleTabClick = (tab: MaskTab) => {
  emit('update:activeTab', tab.key)
  emit('tabClick', tab)
}

const handleTabClose = (key: string) => {
  emit('tabClose', key)
}
</script>

<template>
  <div class="h-screen w-screen flex overflow-hidden">
    <!-- 左侧边栏 -->
    <Sidebar
      :title="title"
      :logo="logo"
      :menus="menus"
      :collapsed="innerCollapsed"
      :selected-key="activeTab"
      @update:collapsed="handleCollapsedChange"
      @menu-click="handleMenuClick"
    />

    <!-- 右侧主区域 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 顶部栏 -->
      <TopBar
        :tabs="tabs"
        :active-tab="activeTab"
        :actions="actions"
        @tab-click="handleTabClick"
        @tab-close="handleTabClose"
      >
        <template #toolbar>
          <slot name="toolbar" />
        </template>
      </TopBar>

      <!-- 内容区 -->
      <Content>
        <slot />
      </Content>
    </div>
  </div>
</template>
