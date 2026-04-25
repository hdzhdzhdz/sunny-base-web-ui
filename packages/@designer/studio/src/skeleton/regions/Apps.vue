<!--
  Apps - 左侧面板区域

  由两部分组成：

  ## 结构

  ```
  ┌─────────────────────────────┐
  │ 图标栏 (48px)  │ 面板内容区 (352px)  │
  │                │                      │
  │ [页面管理图标]  │  面板标题            │
  │ [组件库图标]    │  ───────            │
  │                │  KeepAlive 内容      │
  │ ── 分割线 ──   │                      │
  │ [其他类型图标]  │                      │
  └─────────────────────────────┘
  ```

  ## 交互逻辑

  | 操作 | 行为 |
  |------|------|
  | 点击未激活的 panel 图标 | 展开面板并激活该 Widget |
  | 点击已激活的 panel 图标 | 折叠面板 |
  | 点击 dialog 类型图标 | 调用 widget.handler() |
  | 点击 link 类型图标 | window.open(widget.link) |
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

/** panel 类型 Widget 列表（在 apps 区域内） */
const panelWidgets = computed(() => props.widgetRegistry.getPanelWidgets('apps'))

/** 非 panel 类型 Widget 列表（dialog/link，在 apps 区域内） */
const otherWidgets = computed(() => props.widgetRegistry.getOtherWidgets('apps'))

/** 当前激活的 Widget */
const activeWidget = computed(() => {
  if (!activeWidgetName.value) return null
  return props.widgetRegistry.get(activeWidgetName.value)
})

/** 面板区缓存的组件名列表（用于 KeepAlive include） */
const cachedComponents = computed(() => {
  return panelWidgets.value
    .filter((w) => w.component)
    .map((w) => w.name)
})

/**
 * 点击图标
 *
 * 根据 Widget 的 openType 分发到不同处理逻辑。
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
 *
 * - 点击已激活 → 折叠面板
 * - 点击未激活 → 展开并激活该面板
 */
function handlePanelClick(widget: Widget) {
  if (activeWidgetName.value === widget.name) {
    panelExpanded.value = false
    activeWidgetName.value = null
  } else {
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
