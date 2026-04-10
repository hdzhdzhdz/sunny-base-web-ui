<!--
  Apps - 左侧面板区域

  由两部分组成：
  1. 图标栏（始终可见，48px）
     - 上部：panel 类型 Widget 图标（点击切换面板展开/折叠）
     - 分割线
     - 下部：dialog/link 类型 Widget 图标
  2. 面板内容区（展开时可见，352px）
     - KeepAlive 缓存当前激活的 Widget 面板内容

  交互：
  - 点击已激活的 panel 图标 → 折叠面板
  - 点击未激活的 panel 图标 → 切换到该面板（展开）
  - 折叠状态下点击 panel 图标 → 展开并激活该面板
-->
<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import type { WidgetRegistry } from '../widgets/widget-registry'
import type { Widget } from '../widgets/types'

defineOptions({ name: 'DesignerApps' })

const props = defineProps<{
  /** Widget 注册表 */
  widgetRegistry: WidgetRegistry
}>()

/** 当前激活的 panel Widget name */
const activeWidgetName = ref<string | null>(null)

/** 面板是否展开 */
const panelExpanded = ref(false)

/** panel 类型 Widget 列表 */
const panelWidgets = computed(() => props.widgetRegistry.getPanelWidgets('apps'))

/** 非 panel 类型 Widget 列表 */
const otherWidgets = computed(() => props.widgetRegistry.getOtherWidgets('apps'))

/** 当前激活的 Widget */
const activeWidget = computed(() => {
  if (!activeWidgetName.value) return null
  return props.widgetRegistry.get(activeWidgetName.value)
})

/** 面板区缓存的组件列表（用于 KeepAlive include） */
const cachedComponents = computed(() => {
  return panelWidgets.value
    .filter((w) => w.component)
    .map((w) => w.name)
})

/**
 * 点击图标
 */
function handleIconClick(widget: Widget) {
  if (widget.openType === 'panel') {
    handlePanelClick(widget)
  } else if (widget.openType === 'dialog') {
    widget.handler?.()
  } else if (widget.openType === 'link' && widget.link) {
    window.open(widget.link, '_blank')
  }
}

/**
 * panel 类型点击：切换/折叠
 */
function handlePanelClick(widget: Widget) {
  if (activeWidgetName.value === widget.name) {
    // 再次点击已激活的 → 折叠
    panelExpanded.value = false
    activeWidgetName.value = null
  } else {
    // 切换到新面板
    activeWidgetName.value = widget.name
    panelExpanded.value = true
  }
}
</script>

<template>
  <div class="flex h-full shrink-0">
    <!-- 图标栏 -->
    <div class="w-[48px] flex flex-col items-center py-2 gap-1 border-r border-[var(--color-border-2)] bg-[var(--color-bg-2)] shrink-0">
      <!-- panel 类型图标 -->
      <a-tooltip
        v-for="widget in panelWidgets"
        :key="widget.name"
        :content="widget.title"
        position="right"
      >
        <span
          class="flex items-center justify-center w-[36px] h-[36px] rounded cursor-pointer transition-colors"
          :class="[
            activeWidgetName === widget.name
              ? 'bg-[rgba(var(--primary-6),0.1)] text-[rgb(var(--primary-6))]'
              : 'text-[var(--color-text-2)] hover:bg-[var(--color-fill-2)] hover:text-[var(--color-text-1)]',
          ]"
          @click="handleIconClick(widget)"
        >
          <component :is="widget.icon" :size="20" />
        </span>
      </a-tooltip>

      <!-- 分割线（两种类型都有时显示） -->
      <div v-if="panelWidgets.length && otherWidgets.length" class="w-[24px] h-[1px] bg-[var(--color-border-2)] my-1" />

      <!-- 非 panel 类型图标 -->
      <a-tooltip
        v-for="widget in otherWidgets"
        :key="widget.name"
        :content="widget.title"
        position="right"
      >
        <span
          class="flex items-center justify-center w-[36px] h-[36px] rounded cursor-pointer text-[var(--color-text-2)] hover:bg-[var(--color-fill-2)] hover:text-[var(--color-text-1)] transition-colors"
          @click="handleIconClick(widget)"
        >
          <component :is="widget.icon" :size="20" />
        </span>
      </a-tooltip>
    </div>

    <!-- 面板内容区 -->
    <div
      class="border-r border-[var(--color-border-2)] bg-[var(--color-bg-2)] overflow-hidden transition-[width] duration-200"
      :style="{ width: panelExpanded ? '352px' : '0px' }"
    >
      <div v-if="panelExpanded && activeWidget" class="w-[352px] h-full flex flex-col">
        <!-- 面板标题 -->
        <div class="flex items-center justify-between h-[40px] px-3 border-b border-[var(--color-border-2)] shrink-0">
          <span class="text-sm font-medium text-[var(--color-text-1)]">{{ activeWidget.title }}</span>
          <span
            class="flex items-center justify-center w-6 h-6 rounded cursor-pointer text-[var(--color-text-3)] hover:bg-[var(--color-fill-2)] hover:text-[var(--color-text-1)] transition-colors"
            @click="panelExpanded = false; activeWidgetName = null"
          >
            <icon-close :size="14" />
          </span>
        </div>

        <!-- 面板内容（KeepAlive 缓存） -->
        <div class="flex-1 overflow-y-auto">
          <KeepAlive :include="cachedComponents">
            <component
              :is="activeWidget.component"
              :key="activeWidget.name"
            />
          </KeepAlive>
        </div>
      </div>
    </div>
  </div>
</template>
