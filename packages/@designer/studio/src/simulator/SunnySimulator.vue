<!--
  SunnySimulator - 渲染模拟器（Vue 组件层）

  Simulator 类的 Vue 响应式包装。负责：
  - 将 Vue props 响应式变化桥接到 Simulator 类的方法调用
  - 管理 Simulator 实例的创建/销毁生命周期

  两种使用方式：
  1. 独立使用（不接入 Engine）：直接传 schema + materialStore props
  2. Engine 驱动：通过 getSimulator() 获取底层 Simulator 实例
-->
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { NodeModelJSON } from '@sunny-base-web/designer-core'
import type { MaterialStore } from '@sunny-base-web/designer-materials'
import { Simulator } from './simulator'

const props = defineProps<{
  /** 根节点 schema（页面的组件树根节点） */
  schema: NodeModelJSON | null
  /** 物料存储 */
  materialStore: MaterialStore
}>()

/** 容器 ref（Simulator 在此容器内创建 iframe） */
const containerRef = ref<HTMLDivElement>()

/** Simulator 实例 */
let simulator: Simulator | null = null

onMounted(() => {
  initSimulator()
})

onBeforeUnmount(() => {
  destroySimulator()
})

// 监听 schema 变化 → 委托给 Simulator 渲染
watch(
  () => props.schema,
  (newSchema: NodeModelJSON | null) => {
    simulator?.renderBlock(newSchema)
  },
  { deep: true },
)

/**
 * 初始化模拟器
 */
function initSimulator() {
  const container = containerRef.value
  if (!container) return

  simulator = new Simulator({ materialStore: props.materialStore })
  simulator.mount(container)

  // 如果已有 schema，立即渲染
  if (props.schema) {
    // 等待 iframe load 后再渲染（Simulator mount 是异步的）
    // 用 nextTick 保证 mounted 完成
    setTimeout(() => {
      simulator?.renderBlock(props.schema)
    }, 0)
  }
}

/**
 * 销毁模拟器
 */
function destroySimulator() {
  simulator?.destroy()
  simulator = null
}

/**
 * 获取底层 Simulator 实例（供 Engine 使用）
 */
function getSimulator(): Simulator | null {
  return simulator
}

defineExpose({
  getSimulator,
})
</script>

<template>
  <div ref="containerRef" class="sunny-simulator" />
</template>

<style scoped>
.sunny-simulator {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
