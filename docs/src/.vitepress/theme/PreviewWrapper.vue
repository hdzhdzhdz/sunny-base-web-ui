<script setup>
import { ElementPlusContainer } from '@vitepress-demo-preview/component'
import { useAttrs, computed } from 'vue'

defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

// 过滤掉 ElementPlusContainer 不接受的属性
// Filter out attributes that ElementPlusContainer does not accept
const filteredAttrs = computed(() => {
  const { suffixName, absolutePath, relativePath, ...rest } = attrs
  return rest
})
</script>

<template>
  <ElementPlusContainer v-bind="filteredAttrs">
    <slot />
  </ElementPlusContainer>
</template>
