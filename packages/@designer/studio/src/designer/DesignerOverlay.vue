<!--
  DesignerOverlay - 画布交互渲染层

  消费 useDesigner 计算出的样式，渲染悬浮高亮、选中框和操作工具栏。
  纯展示组件，不包含任何业务逻辑。

  ## 渲染元素

  | 元素 | 条件 | 样式 |
  |------|------|------|
  | Hover overlay | hoveredNodeId 非空 | 虚线边框 + 主题色透明背景 |
  | Select overlay | selectedNodeId 非空 | 实线边框 + 主题色浅背景 |
  | Toolbar | selectedNodeId 非空 | 右上角操作栏（上移/下移/删除） |

  所有 overlay 使用 `pointer-events: none` 透传鼠标事件到 iframe，
  工具栏按钮使用 `pointer-events: auto` 捕获点击。
-->
<script setup lang="ts">
import { ChevronUp, ChevronDown, Trash2 } from '@sunny-base-web/icons'
import type { OverlayStyle } from './useDesigner'
import type { Designer } from './designer'

defineOptions({ name: 'DesignerOverlay' })

const props = defineProps<{
  /** 悬浮节点定位样式 */
  hoverStyle: OverlayStyle | null
  /** 选中节点定位样式 */
  selectStyle: OverlayStyle | null
  /** 工具栏定位样式 */
  toolbarStyle: OverlayStyle | null
  /** 选中节点组件名称 */
  selectedNodeName: string | null
  /** Designer 实例（用于调用 actions） */
  designer: Designer
  /** 是否正在拖拽（拖拽时禁用所有 pointer-events，避免拦截 drop 事件） */
  dragging?: boolean
}>()

function handleMoveUp() {
  const nodeId = props.designer.selectedNodeId.value
  if (nodeId) props.designer.actions.onNodeMoveUp?.(nodeId)
}

function handleMoveDown() {
  const nodeId = props.designer.selectedNodeId.value
  if (nodeId) props.designer.actions.onNodeMoveDown?.(nodeId)
}

function handleDelete() {
  const nodeId = props.designer.selectedNodeId.value
  if (nodeId) props.designer.actions.onNodeDelete?.(nodeId)
}
</script>

<template>
  <!-- Hover overlay -->
  <div
    v-if="hoverStyle"
    class="fixed pointer-events-none z-[999] border-[2px] border-dashed border-[rgba(var(--primary-6),0.6)] bg-[rgba(var(--primary-6),0.04)]"
    :style="hoverStyle"
  />

  <!-- Select overlay -->
  <div
    v-if="selectStyle"
    class="fixed pointer-events-none z-[999] border-[2px] border-solid border-[rgb(var(--primary-6))] bg-[rgba(var(--primary-6),0.06)]"
    :style="selectStyle"
  />

  <!-- Toolbar -->
  <div
    v-if="toolbarStyle"
    class="fixed pointer-events-none z-[1000]"
    :style="toolbarStyle"
  >
    <div :class="dragging ? 'pointer-events-none' : 'pointer-events-auto'" class="flex items-center h-full bg-[var(--color-bg-5)] rounded shadow-sm border border-[var(--color-border-2)]">
      <!-- 节点名称 -->
      <span
        v-if="selectedNodeName"
        class="px-2 text-xs text-[var(--color-text-2)] truncate max-w-[60px]"
        :title="selectedNodeName"
      >
        {{ selectedNodeName }}
      </span>

      <!-- 分隔线 -->
      <div
        v-if="selectedNodeName"
        class="w-px h-3 bg-[var(--color-border-2)]"
      />

      <!-- 上移 -->
      <button
        class="flex items-center justify-center w-6 h-6 text-[var(--color-text-2)] hover:text-[rgb(var(--primary-6))] hover:bg-[rgba(var(--primary-6),0.1)] rounded transition-colors"
        title="上移"
        @click="handleMoveUp"
      >
        <ChevronUp :size="14" />
      </button>

      <!-- 下移 -->
      <button
        class="flex items-center justify-center w-6 h-6 text-[var(--color-text-2)] hover:text-[rgb(var(--primary-6))] hover:bg-[rgba(var(--primary-6),0.1)] rounded transition-colors"
        title="下移"
        @click="handleMoveDown"
      >
        <ChevronDown :size="14" />
      </button>

      <!-- 删除 -->
      <button
        class="flex items-center justify-center w-6 h-6 text-[var(--color-text-3)] hover:text-[rgb(var(--danger-6))] hover:bg-[rgba(var(--danger-6),0.1)] rounded transition-colors"
        title="删除"
        @click="handleDelete"
      >
        <Trash2 :size="14" />
      </button>
    </div>
  </div>
</template>
