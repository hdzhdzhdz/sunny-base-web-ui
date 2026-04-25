<!--
  PagesWidget - 页面管理面板

  展示项目中的页面列表，支持点击切换当前页面。

  ## 功能

  - 点击页面 → 调用 Engine.switchPage(pageId) 切换当前页面
  - 当前激活页面高亮显示（主题色背景）

  ## 数据流

  ```
  Engine.project.pages → 页面列表
  Engine.project.activePageId → 当前激活页面
  点击页面 → Engine.switchPage(pageId) → EVENT_PAGE_SWITCH → Workspace 重渲染
  ```
-->
<script setup lang="ts">
import { computed, inject } from 'vue'
import type { Engine } from '../../../engine'

defineOptions({ name: 'PagesWidget' })

// 通过 inject 获取 Engine（由 SunnyDesignerLayout provide）
const engine = inject<Engine>('designer-engine')!

/** 页面列表 */
const pages = computed(() => engine.project.pages ?? [])

/** 当前活跃页面 ID */
const activePageId = computed(() => engine.project.activePageId ?? '')

/**
 * 点击页面 → 切换当前页面
 *
 * @param pageId - 目标页面 ID
 */
function handlePageClick(pageId: string) {
  engine.switchPage(pageId)
}
</script>

<template>
  <div class="p-3">
    <!-- 页面列表 -->
    <div class="space-y-1">
      <div
        v-for="page in pages"
        :key="page.id"
        class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors"
        :class="[
          page.id === activePageId
            ? 'bg-[rgba(var(--primary-6),0.1)] text-[rgb(var(--primary-6))]'
            : 'text-[var(--color-text-2)] hover:bg-[var(--color-fill-2)] hover:text-[var(--color-text-1)]',
        ]"
        @click="handlePageClick(page.id)"
      >
        <icon-file :size="16" />
        <span class="text-sm truncate">{{ page.name }}</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="pages.length === 0" class="text-center text-[var(--color-text-3)] text-sm py-8">
      暂无页面
    </div>
  </div>
</template>
