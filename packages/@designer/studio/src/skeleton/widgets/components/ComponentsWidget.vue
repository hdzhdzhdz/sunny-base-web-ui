<!--
  ComponentsWidget - 组件库面板

  从 MaterialStore 获取物料分组，按分组折叠展示。
  每个组件支持 draggable，拖拽到画布 Workspace 创建节点。

  ## 功能

  1. 搜索过滤 — 按组件名或标题模糊匹配
  2. 分组折叠 — 按 ComponentMeta.group 字段分组
  3. 拖拽创建 — dragstart 设置 component-name，Workspace drop 时创建节点

  ## 数据流

  ```
  MaterialStore.getGroups() → 分组列表
  MaterialStore.getByGroup(group) → 每组的组件列表
  拖拽 → setData('component-name', meta.name)
       → Workspace.handleDrop → new NodeModel(componentName)
  ```
-->
<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { MaterialStore, ComponentMeta } from '@sunny-base-web/designer-materials'

defineOptions({ name: 'ComponentsWidget' })

// 通过 inject 获取 MaterialStore（由 SunnyDesignerLayout provide）
const materialStore = inject<MaterialStore>('designer-material-store')!

/** 搜索关键词 */
const searchKeyword = ref('')

/** 分组列表 */
const groups = computed(() => materialStore?.getGroups() ?? [])

/** 当前展开的分组 */
const expandedGroups = ref<string[]>(groups.value)

/** 按分组获取组件列表（带搜索过滤） */
function getComponentsByGroup(group: string): ComponentMeta[] {
  const list = materialStore?.getByGroup(group) ?? []
  if (!searchKeyword.value) return list
  const kw = searchKeyword.value.toLowerCase()
  return list.filter(
    (m) =>
      m.name.toLowerCase().includes(kw) ||
      m.title.toLowerCase().includes(kw),
  )
}

/** 搜索过滤后的分组（空组不显示） */
const filteredGroups = computed(() => {
  if (!searchKeyword.value) return groups.value
  return groups.value.filter((g) => getComponentsByGroup(g).length > 0)
})

/**
 * 拖拽开始
 *
 * 设置 component-name 到 dataTransfer，供 Workspace drop 时读取。
 */
function handleDragStart(e: DragEvent, meta: ComponentMeta) {
  e.dataTransfer?.setData('component-name', meta.name)
  e.dataTransfer!.effectAllowed = 'copy'
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 搜索栏 -->
    <div class="px-3 py-2 border-b border-[var(--color-border-2)] shrink-0">
      <a-input
        v-model="searchKeyword"
        placeholder="搜索组件"
        allow-clear
        size="small"
      >
        <template #prefix>
          <icon-search :size="14" />
        </template>
      </a-input>
    </div>

    <!-- 分组列表 -->
    <div class="flex-1 overflow-y-auto p-3">
      <a-collapse
        :default-active-key="expandedGroups"
        :bordered="false"
        expand-icon-position="right"
      >
        <a-collapse-item
          v-for="group in filteredGroups"
          :key="group"
          :header="group"
        >
          <!-- 组件网格 -->
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="meta in getComponentsByGroup(group)"
              :key="meta.name"
              class="flex flex-col items-center gap-1 p-2 rounded cursor-grab border border-[var(--color-border-1)] hover:border-[rgb(var(--primary-6))] hover:bg-[rgba(var(--primary-6),0.04)] transition-colors active:cursor-grabbing"
              draggable="true"
              @dragstart="handleDragStart($event, meta)"
            >
              <!-- 图标 -->
              <div class="flex items-center justify-center w-8 h-8 rounded bg-[var(--color-fill-2)]">
                <component :is="meta.icon" v-if="meta.icon" :size="18" />
                <icon-apps v-else :size="18" />
              </div>
              <!-- 名称 -->
              <span class="text-xs text-[var(--color-text-2)] text-center truncate w-full">{{ meta.title }}</span>
            </div>
          </div>
        </a-collapse-item>
      </a-collapse>

      <!-- 空状态 -->
      <div v-if="filteredGroups.length === 0" class="text-center text-[var(--color-text-3)] text-sm py-8">
        {{ searchKeyword ? '未找到匹配的组件' : '暂无注册组件' }}
      </div>
    </div>
  </div>
</template>
