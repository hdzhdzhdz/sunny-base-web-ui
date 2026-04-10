<!--
  SunnyDesignerLayout - 设计器主布局

  ┌──────────────────────────────────────────────────────────────┐
  │ Header: Brand | Toolbar | Actions                            │
  ├──────────┬──────────────────────────────────┬────────────────┤
  │  Apps    │        Workspace                 │    Settings    │
  │  左侧栏  │          中间画布                 │    右侧面板    │
  │  48+352  │                                  │    350px       │
  ├──────────┴──────────────────────────────────┴────────────────┤
  │ Footer: NodePath | Devtools                                  │
  └──────────────────────────────────────────────────────────────┘

  通过 provide 向子组件注入 Engine 实例及相关子系统：
  - designer-engine: Engine
  - designer-material-store: MaterialStore
-->
<script setup lang="ts">
import { provide, type Component } from 'vue'
import type { Engine } from '../engine'
import type { WidgetRegistry } from './widgets/widget-registry'
import Header from './regions/Header.vue'
import Apps from './regions/Apps.vue'
import Workspace from './regions/Workspace.vue'
import Settings from './regions/Settings.vue'
import Footer from './regions/Footer.vue'

defineOptions({
  name: 'SunnyDesignerLayout',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  /** 应用标题 */
  title?: string
  /** Logo */
  logo?: string | Component
  /** Widget 注册表 */
  widgetRegistry: WidgetRegistry
  /** Engine 实例（provide 给子组件） */
  engine: Engine
}>(), {
  title: 'Designer',
})

// provide 给子 Widget 组件使用
provide('designer-engine', props.engine)
provide('designer-material-store', props.engine.materialStore)
</script>

<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden bg-[var(--color-bg-1)]">
    <!-- 顶栏 -->
    <Header :title="title" :logo="logo">
      <template #toolbar>
        <slot name="toolbar" />
      </template>
      <template #actions>
        <slot name="actions" />
      </template>
    </Header>

    <!-- 主体：三栏 -->
    <div class="flex-1 flex min-h-0">
      <!-- 左侧：Apps -->
      <Apps :widget-registry="widgetRegistry" />

      <!-- 中间：画布 -->
      <Workspace>
        <slot name="workspace" />
      </Workspace>

      <!-- 右侧：属性面板 -->
      <Settings>
        <slot name="settings" />
      </Settings>
    </div>

    <!-- 底栏 -->
    <Footer>
      <template #node-path>
        <slot name="node-path" />
      </template>
      <template #devtools>
        <slot name="devtools" />
      </template>
    </Footer>
  </div>
</template>
