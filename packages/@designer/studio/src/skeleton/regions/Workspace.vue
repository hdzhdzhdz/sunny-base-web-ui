<!--
  Workspace - 中间画布区域

  包裹画布内容，提供 Simulator 的挂载容器。
  自动监听 Engine 事件，驱动 Simulator 重渲染。
  处理从组件库拖拽到画布的 drop 事件。
-->
<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount } from 'vue'
import { DesignerEventType, NodeModel } from '@sunny-base-web/designer-core'
import type { NodeModelJSON } from '@sunny-base-web/designer-core'
import type { Engine } from '../../engine'
import { Simulator } from '../../simulator/simulator'
import { EventBridge } from '../../simulator/event-bridge'
import { Designer } from '../../designer/designer'

defineOptions({ name: 'DesignerWorkspace' })

const emit = defineEmits<{
  (e: 'nodeClick', nodeId: string): void
  (e: 'nodeHover', nodeId: string): void
}>()

const engine = inject<Engine>('designer-engine')!

const containerRef = ref<HTMLElement>()
let simulator: Simulator | null = null
let bridge: EventBridge | null = null
let designer: Designer | null = null
let unsubscribers: (() => void)[] = []

onMounted(() => {
  if (!containerRef.value) return

  // 创建 Simulator
  simulator = new Simulator({ materialStore: engine.materialStore })
  simulator.mount(containerRef.value)

  // 拖拽期间禁用 iframe 指针事件，让 drag 事件穿透到父容器
  const iframe = containerRef.value.querySelector('iframe')
  document.addEventListener('dragstart', () => {
    if (iframe) iframe.style.pointerEvents = 'none'
  })
  document.addEventListener('dragend', () => {
    if (iframe) iframe.style.pointerEvents = ''
  })

  // 创建 EventBridge
  const doc = simulator.getDocument()
  if (doc) {
    bridge = new EventBridge(doc)
    bridge.on('nodeClick', (e) => {
      engine.select(e.nodeId)
      emit('nodeClick', e.nodeId)
    })
    bridge.on('nodeHover', (e) => {
      emit('nodeHover', e.nodeId)
    })
  }

  // 创建 Designer（画布交互）
  designer = new Designer({
    simulator,
    selection: engine.selection,
    materialStore: engine.materialStore,
    eventBus: engine.eventBus,
    actions: {
      onNodeDelete: (nodeId) => {
        engine.select(null)
        engine.removeNode(nodeId)
      },
      onNodeMoveUp: (nodeId) => engine.moveNodeUp(nodeId),
      onNodeMoveDown: (nodeId) => engine.moveNodeDown(nodeId),
    },
  })
  designer.activate()

  // 初始渲染当前 Block
  renderCurrentBlock()

  // 监听 Engine 事件 → 驱动 Simulator
  const unsubProjectLoaded = engine.eventBus.on(DesignerEventType.ProjectLoaded, () => {
    renderCurrentBlock()
  })

  const unsubPageSwitched = engine.eventBus.on(DesignerEventType.PageSwitched, () => {
    engine.select(null)
    renderCurrentBlock()
  })

  const unsubNodeAdded = engine.eventBus.on(DesignerEventType.NodeAdded, () => {
    renderCurrentBlock()
  })

  const unsubNodeRemoved = engine.eventBus.on(DesignerEventType.NodeRemoved, () => {
    renderCurrentBlock()
  })

  const unsubNodeMoved = engine.eventBus.on(DesignerEventType.NodeMoved, () => {
    renderCurrentBlock()
  })

  const unsubNodePropsChanged = engine.eventBus.on(DesignerEventType.NodePropsChanged, (payload) => {
    if (simulator?.isMounted()) {
      const block = engine.getActiveBlock()
      if (block) {
        const node = block.findNode(payload.nodeId)
        if (node) {
          simulator.renderNodeUpdate(payload.nodeId, node.toJSON())
        }
      }
    }
  })

  const unsubHistoryRestored = engine.eventBus.on(DesignerEventType.HistoryRestored, () => {
    renderCurrentBlock()
  })

  unsubscribers = [
    unsubProjectLoaded,
    unsubPageSwitched,
    unsubNodeAdded,
    unsubNodeRemoved,
    unsubNodeMoved,
    unsubNodePropsChanged,
    unsubHistoryRestored,
  ]
})

onBeforeUnmount(() => {
  for (const unsub of unsubscribers) unsub()
  unsubscribers = []

  designer?.deactivate()
  bridge?.teardown()
  simulator?.destroy()

  designer = null
  bridge = null
  simulator = null
})

/** 渲染当前活跃 Block */
function renderCurrentBlock() {
  if (!simulator?.isMounted()) return
  const json = engine.getActiveBlockJSON()
  const rootJSON = json?.rootNode ?? null
  simulator.renderBlock(rootJSON as NodeModelJSON | null)
}

/** 处理从组件库拖拽到画布的 drop */
function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  const componentName = e.dataTransfer?.getData('component-name')
  if (!componentName) return

  // 从 MaterialStore 获取默认 snippet
  const meta = engine.materialStore.getMeta(componentName)
  if (!meta?.snippets?.length) return

  const snippet = meta.snippets[0]
  const block = engine.getActiveBlock()
  if (!block?.rootNode) return

  // 从 snippet props 创建 NodeModel
  const node = new NodeModel(engine.eventBus, componentName, {
    props: snippet.props,
  })
  engine.addNode(block.rootNode.id, node)

  // 拖入后自动选中新节点
  engine.select(node.id)
}
</script>

<template>
  <div
    ref="containerRef"
    class="flex-1 overflow-hidden bg-[var(--color-fill-1)] relative"
    @dragover="handleDragOver"
    @drop="handleDrop"
  />
</template>
