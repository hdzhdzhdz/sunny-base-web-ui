<script setup lang="ts">
import { computed, type Component } from 'vue'

defineOptions({ name: 'Brand' })

const props = withDefaults(defineProps<{
  title?: string
  logo?: string | Component
  collapsed?: boolean
}>(), {
  collapsed: false,
})

const isComponent = computed(() => typeof props.logo !== 'string')
</script>

<template>
  <div class="flex items-center h-[48px] px-4 gap-2 overflow-hidden shrink-0">
    <component :is="logo" v-if="logo && isComponent" class="shrink-0" :size="28" />
    <img v-else-if="logo && !isComponent" :src="logo as string" alt="Logo" class="h-7 shrink-0" />
    <span
      v-if="title && !collapsed"
      class="text-base font-semibold truncate whitespace-nowrap"
    >
      {{ title }}
    </span>
  </div>
</template>
