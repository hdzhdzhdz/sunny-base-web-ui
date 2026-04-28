<!--
  Workspace - 中间画布区域

  设计器最核心的区域，包裹 Simulator iframe 并驱动画布渲染。

  ## 职责

  1. 创建 Simulator 实例并挂载到容器
  2. 创建 Designer 实例处理画布交互（选中/悬浮/操作按钮）
  3. 监听全局 emitter 事件驱动 Simulator 重渲染
  4. 处理从组件库拖拽到画布的 drop 事件

  ## 事件 → 渲染映射

  | 事件 | 渲染策略 | 说明 |
  |------|---------|------|
  | EVENT_PROJECT_LOAD | 全量渲染 | 项目加载 |
  | EVENT_PAGE_SWITCH | 全量渲染 + 清空选中 | 页面切换 |
  | EVENT_NODE_CHANGE (props/events/directive) | 增量更新 | 属性变更 |
  | EVENT_NODE_CHANGE (add/remove/move) | 全量渲染 | 结构变更 |
  | EVENT_BLOCK_CHANGE | 全量渲染 | Block 级别变更 |
  | EVENT_HISTORY_RESTORE | 全量渲染 | 撤销/重做恢复 |

  ## 拖拽交互

  ```
  ComponentsWidget (拖拽源)
    → dragstart: setData('component-name', name)
    → dragover Workspace: preventDefault + dropEffect='copy'
    → drop Workspace: getData → MaterialStore.getMeta → new NodeModel → Engine.addNode
  ```
-->
<script setup lang="ts">
import { ref, shallowRef, inject, onMounted, onBeforeUnmount } from 'vue'
import {
  emitter,
  EVENT_NODE_CHANGE,
  EVENT_BLOCK_CHANGE,
  EVENT_PAGE_SWITCH,
  EVENT_PROJECT_LOAD,
  EVENT_HISTORY_RESTORE,
} from '@sunny-base-web/designer-core'
import type { NodeModelJSON } from '@sunny-base-web/designer-core'
import { NodeModel } from '@sunny-base-web/designer-core'
import type { Engine } from '../../engine'
import { Simulator } from '../../simulator/simulator'
import { Designer } from '../../designer/designer'
import { useDesigner } from '../../designer/useDesigner'
import DesignerOverlay from '../../designer/DesignerOverlay.vue'

defineOptions({ name: 'DesignerWorkspace' })

const emit = defineEmits<{
  (e: 'nodeClick', nodeId: string): void
  (e: 'nodeHover', nodeId: string): void
}>()

const engine = inject<Engine>('designer-engine')!

const containerRef = ref<HTMLElement>()
let simulator: Simulator | null = null
let unsubscribers: (() => void)[] = []

const designer = shallowRef<Designer>()
const designerState = shallowRef<ReturnType<typeof useDesigner> | null>(null)
const isDragging = ref(false)

onMounted(() => {
  if (!containerRef.value) return

  // 创建 Simulator
  simulator = new Simulator({ materialStore: engine.materialStore })
  simulator.mount(containerRef.value)

  // 拖拽期间禁用 iframe 指针事件，让 drag 事件穿透到父容器
  const iframe = containerRef.value.querySelector('iframe')
  document.addEventListener('dragstart', () => {
    if (iframe) iframe.style.pointerEvents = 'none'
    isDragging.value = true
  })
  document.addEventListener('dragend', () => {
    if (iframe) iframe.style.pointerEvents = ''
    isDragging.value = false
  })

  // 创建 Designer（画布交互）
  const d = new Designer({
    simulator,
    engine,
    materialStore: engine.materialStore,
    actions: {
      onNodeDelete: (nodeId) => {
        engine.select(null)
        engine.removeNode(nodeId)
      },
      onNodeMoveUp: (nodeId) => engine.moveNodeUp(nodeId),
      onNodeMoveDown: (nodeId) => engine.moveNodeDown(nodeId),
    },
  })
  d.activate()
  designer.value = d
  designerState.value = useDesigner(d)

  // Simulator 就绪后渲染当前 Block
  simulator.onReady(() => {
    renderCurrentBlock()
  })

  // 监听全局 emitter 事件 → 驱动 Simulator

  const projectLoadedHandler = () => {
    renderCurrentBlock()
  }
  emitter.on(EVENT_PROJECT_LOAD, projectLoadedHandler)
  unsubscribers.push(() => emitter.off(EVENT_PROJECT_LOAD, projectLoadedHandler))

  const pageSwitchHandler = () => {
    engine.select(null)
    renderCurrentBlock()
  }
  emitter.on(EVENT_PAGE_SWITCH, pageSwitchHandler)
  unsubscribers.push(() => emitter.off(EVENT_PAGE_SWITCH, pageSwitchHandler))

  const nodeChangeHandler = (payload: { action: string; nodeId?: string }) => {
    if (payload.action === 'props' || payload.action === 'events' || payload.action === 'directive') {
      // 属性/事件/指令变更 → 增量更新单个节点
      if (simulator?.isMounted() && payload.nodeId) {
        const block = engine.getActiveBlock()
        if (block) {
          const node = block.findNode(payload.nodeId)
          if (node) {
            simulator.renderNodeUpdate(payload.nodeId, node.toJSON())
          }
        }
      }
    } else {
      // 结构变更（add/remove/move）→ 全量重绘
      renderCurrentBlock()
    }
  }
  emitter.on(EVENT_NODE_CHANGE, nodeChangeHandler)
  unsubscribers.push(() => emitter.off(EVENT_NODE_CHANGE, nodeChangeHandler))

  const blockChangeHandler = () => {
    renderCurrentBlock()
  }
  emitter.on(EVENT_BLOCK_CHANGE, blockChangeHandler)
  unsubscribers.push(() => emitter.off(EVENT_BLOCK_CHANGE, blockChangeHandler))

  const historyRestoreHandler = () => {
    renderCurrentBlock()
  }
  emitter.on(EVENT_HISTORY_RESTORE, historyRestoreHandler)
  unsubscribers.push(() => emitter.off(EVENT_HISTORY_RESTORE, historyRestoreHandler))
})

onBeforeUnmount(() => {
  for (const unsub of unsubscribers) unsub()
  unsubscribers = []

  designer.value?.deactivate()
  simulator?.destroy()

  designer.value = undefined
  designerState.value = null
  simulator = null
})

/** 渲染当前活跃 Block 到 Simulator */
function renderCurrentBlock() {
  if (!simulator?.isMounted()) return
  const json = engine.getActiveBlockJSON()
  const rootJSON = json?.rootNode ?? null
  simulator.renderBlock(rootJSON as NodeModelJSON | null)
}

/** 处理拖拽悬停（允许 drop） */
function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

/** 处理从组件库拖拽到画布的 drop */
function handleDrop(e: DragEvent) {
  e.preventDefault()
  const componentName = e.dataTransfer?.getData('component-name')
  if (!componentName) return

  const meta = engine.materialStore.getMeta(componentName)
  if (!meta?.snippets?.length) return

  const snippet = meta.snippets[0]
  const block = engine.getActiveBlock()
  if (!block?.rootNode) return

  const node = new NodeModel(componentName, {
    props: snippet.props,
  })
  engine.addNode(block.rootNode.id, node)
  engine.select(node.id)
}
</script>

<template>
  <div
    ref="containerRef"
    class="flex-1 overflow-hidden bg-[var(--color-fill-1)] relative"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <DesignerOverlay
      v-if="designerState"
      :hover-style="designerState.hoverStyle.value"
      :select-style="designerState.selectStyle.value"
      :toolbar-style="designerState.toolbarStyle.value"
      :selected-node-name="designerState.selectedNodeName.value"
      :hovered-node-name="designerState.hoveredNodeName.value"
      :designer="designerState.designer"
      :dragging="isDragging"
    />
  </div>
</template>
