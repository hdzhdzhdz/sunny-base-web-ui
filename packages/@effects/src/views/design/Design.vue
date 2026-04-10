<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  SunnyDesignerLayout,
  WidgetRegistry,
  createBuiltinWidgets,
  createBuiltinMaterials,
  Engine,
  MaterialStore,
  type ProjectModelJSON,
} from '@sunny-base-web/designer-studio'

defineOptions({
  name: 'DesignPage',
})

/** Widget 注册表 */
const registry = new WidgetRegistry()
registry.registerAll(createBuiltinWidgets())

/** 物料存储 */
const materialStore = new MaterialStore()
materialStore.registerAll(createBuiltinMaterials())

/** Engine 实例 */
const engineRef = ref<Engine | null>(null)

onMounted(() => {
  // 创建 Engine
  const engine = new Engine({ materialStore })
  engineRef.value = engine

  // 加载示例项目
  const sampleProject: ProjectModelJSON = {
    id: 'project-1',
    name: '示例项目',
    activePageId: 'page-1',
    dependencies: [],
    apis: [],
    pages: [
      {
        id: 'page-1',
        name: '首页',
        route: '/home',
        rootNode: {
          id: 'root-1',
          name: 'div',
          props: {},
          events: {},
          directives: [],
          children: [],
          slots: {},
        },
        state: [],
        computed: [],
        methods: [],
        watch: [],
        css: [],
        props: [],
        emits: [],
        expose: [],
        slots: [],
        lifecycleHooks: [],
        inject: [],
      },
    ],
  }
  engine.loadProject(sampleProject)
})

onBeforeUnmount(() => {
  engineRef.value?.destroy()
  engineRef.value = null
})
</script>

<template>
  <SunnyDesignerLayout
    v-if="engineRef"
    title="Sunny Designer"
    :widget-registry="registry"
    :engine="engineRef"
  />
</template>
