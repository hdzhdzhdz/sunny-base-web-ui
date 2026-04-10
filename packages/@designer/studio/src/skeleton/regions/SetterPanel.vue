<!--
  SetterPanel - 属性面板

  根据 Selection 变化自动刷新，展示选中节点的属性编辑器。
  简单实现：按 type 渲染对应输入组件。
-->
<script setup lang="ts">
import { ref, inject, computed, watch } from 'vue'
import { DesignerEventType } from '@sunny-base-web/designer-core'
import type { Engine } from '../../engine'
import { Setter } from '../../setter/setter'

defineOptions({ name: 'SetterPanel' })

const engine = inject<Engine>('designer-engine')!
const setter = new Setter(engine)

/** 响应式刷新标记 */
const refreshKey = ref(0)

// 监听 Selection 变化 → 刷新面板
engine.eventBus.on(DesignerEventType.SelectionChanged, () => {
  refreshKey.value++
})

// 监听属性变化 → 刷新面板
engine.eventBus.on(DesignerEventType.NodePropsChanged, () => {
  refreshKey.value++
})

/** 当前选中节点名称 */
const selectedName = computed(() => {
  void refreshKey.value
  return setter.getSelectedNodeName()
})

/** 属性字段列表 */
const fields = computed(() => {
  void refreshKey.value
  return setter.getFields()
})

/** 事件列表 */
const events = computed(() => {
  void refreshKey.value
  return setter.getEvents()
})

/** 修改属性值 */
function handlePropChange(name: string, value: any) {
  setter.setProp(name, value)
}

/** 当前编辑的事件处理函数 */
const eventHandlers = computed(() => {
  void refreshKey.value
  const node = engine.getSelected()
  return node?.events ?? {}
})

/** 修改事件绑定 */
function handleEventChange(name: string, handler: string) {
  setter.setEvent(name, handler)
}
</script>

<template>
  <div class="p-3">
    <!-- 未选中状态 -->
    <div v-if="!selectedName" class="text-center text-[var(--color-text-3)] text-sm py-8">
      请选中画布中的组件
    </div>

    <!-- 已选中 -->
    <template v-else>
      <!-- 组件名称 -->
      <div class="mb-4 pb-3 border-b border-[var(--color-border-2)]">
        <span class="text-sm font-medium text-[var(--color-text-1)]">{{ selectedName }}</span>
      </div>

      <!-- 属性列表 -->
      <div v-if="fields.length" class="space-y-3">
        <div class="text-xs font-medium text-[var(--color-text-3)] uppercase tracking-wider mb-2">属性</div>
        <div v-for="field in fields" :key="field.name" class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-2)]">{{ field.title }}</label>
          <!-- string -->
          <a-input
            v-if="field.type === 'string'"
            :model-value="field.value"
            size="small"
            @update:model-value="(v: string) => handlePropChange(field.name, v)"
          />
          <!-- number -->
          <a-input-number
            v-else-if="field.type === 'number'"
            :model-value="field.value"
            size="small"
            @update:model-value="(v: number) => handlePropChange(field.name, v)"
          />
          <!-- boolean -->
          <a-switch
            v-else-if="field.type === 'boolean'"
            :model-value="field.value"
            size="small"
            @change="(v: boolean) => handlePropChange(field.name, v)"
          />
          <!-- select -->
          <a-select
            v-else-if="field.type === 'select' && field.options"
            :model-value="field.value"
            size="small"
            :options="field.options"
            @change="(v: any) => handlePropChange(field.name, v)"
          />
          <!-- fallback: string -->
          <a-input
            v-else
            :model-value="String(field.value ?? '')"
            size="small"
            @update:model-value="(v: string) => handlePropChange(field.name, v)"
          />
        </div>
      </div>

      <!-- 事件列表 -->
      <div v-if="events.length" class="space-y-3 mt-4 pt-3 border-t border-[var(--color-border-2)]">
        <div class="text-xs font-medium text-[var(--color-text-3)] uppercase tracking-wider mb-2">事件</div>
        <div v-for="evt in events" :key="evt.name" class="flex flex-col gap-1">
          <label class="text-xs text-[var(--color-text-2)]">{{ evt.name }}</label>
          <a-input
            :model-value="eventHandlers[evt.name] ?? ''"
            size="small"
            :placeholder="evt.description ?? '事件处理函数'"
            @update:model-value="(v: string) => handleEventChange(evt.name, v)"
          />
        </div>
      </div>
    </template>
  </div>
</template>
