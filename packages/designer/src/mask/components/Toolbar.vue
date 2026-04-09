<script setup lang="ts">
import { computed } from 'vue'
import type { MaskAction } from '../types'

defineOptions({ name: 'MaskToolbar' })

const props = withDefaults(defineProps<{
  actions?: MaskAction[]
}>(), {
  actions: () => [],
})

const simpleActions = computed(() => props.actions.filter(a => !a.children?.length))
const dropdownActions = computed(() => props.actions.filter(a => a.children?.length))
</script>

<template>
  <div class="flex items-center gap-1">
    <!-- 简单按钮 -->
    <template v-for="action in simpleActions" :key="action.key">
      <a-tooltip v-if="action.label" :content="action.label">
        <span
          class="flex items-center justify-center w-8 h-8 rounded cursor-pointer hover:bg-[var(--color-fill-2)] transition-colors"
          @click="action.handler?.()"
        >
          <component :is="action.icon" v-if="action.icon" :size="16" />
        </span>
      </a-tooltip>
      <span
        v-else
        class="flex items-center justify-center w-8 h-8 rounded cursor-pointer hover:bg-[var(--color-fill-2)] transition-colors"
        @click="action.handler?.()"
      >
        <component :is="action.icon" v-if="action.icon" :size="16" />
      </span>
    </template>

    <!-- 下拉菜单 -->
    <a-dropdown v-for="action in dropdownActions" :key="action.key" trigger="hover">
      <span
        class="flex items-center justify-center w-8 h-8 rounded cursor-pointer hover:bg-[var(--color-fill-2)] transition-colors"
      >
        <component :is="action.icon" v-if="action.icon" :size="16" />
      </span>
      <template #content>
        <a-doption
          v-for="child in action.children"
          :key="child.key"
          @click="child.handler?.()"
        >
          <template #icon>
            <component :is="child.icon" v-if="child.icon" :size="16" />
          </template>
          {{ child.label }}
        </a-doption>
      </template>
    </a-dropdown>

    <!-- 默认插槽 -->
    <slot />
  </div>
</template>
