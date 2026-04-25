<!--
  SunnyDesignerLayout - 设计器主布局

  三栏式布局骨架，通过 provide 向子组件注入 Engine 和 MaterialStore。

  ## 布局结构

  ```
  ┌────────────────────────────────────────────────────┐
  │ Header (48px)                                      │
  ├──────┬───────────────────────────────┬─────────────┤
  │ Apps │        Workspace              │  Settings   │
  ├──────┴───────────────────────────────┴─────────────┤
  │ Footer (28px)                                      │
  └────────────────────────────────────────────────────┘
  ```

  ## 依赖注入

  | key | 值 | 消费者 |
  |-----|-----|-------|
  | `designer-engine` | Engine 实例 | PagesWidget, ComponentsWidget, SetterPanel, Workspace |
  | `designer-material-store` | MaterialStore | ComponentsWidget |

  ## 使用方式

  ```vue
  <SunnyDesignerLayout
    :engine="engine"
    :widget-registry="widgetRegistry"
    title="低代码设计器"
  >
    <template #toolbar>
       撤销/重做按钮等 
    </template>
    <template #actions>
       预览/保存/发布按钮等 
    </template>
  </SunnyDesignerLayout>
  ```
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
  /** 应用标题（显示在 Header 左侧） */
  title?: string
  /** Logo 组件（显示在 Header 标题左侧） */
  logo?: string | Component
  /** Widget 注册表（提供左侧面板的 Widget 列表） */
  widgetRegistry: WidgetRegistry
  /** Engine 实例（provide 给子组件使用） */
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
      <!-- 左侧：Apps（图标栏 + 面板内容区） -->
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
