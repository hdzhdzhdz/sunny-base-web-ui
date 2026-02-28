<script setup lang="ts">
import type { ScrollAreaRootProps } from 'reka-ui'

import { computed } from 'vue'

import { cn } from '@sunny-base-web/utils'

import { ScrollAreaCorner, ScrollAreaRoot, ScrollAreaViewport } from 'reka-ui'

import { ScrollBar } from './index'

defineOptions({
  name: 'SunnyScrollArea',
});

/** 类名类型 */
type ClassType = string | string[] | Record<string, boolean>;

const props = withDefaults(
  defineProps<
    ScrollAreaRootProps & {
      /** 自定义类名 */
      class?: ClassType;
      /** 滚动事件回调 */
      onScroll?: (event: Event) => void;
    }
  >(),
  {
    onScroll: () => {},
  },
)

const delegatedProps = computed(() => {
  const { class: _, onScroll: __, ...delegated } = props
  return delegated
})
</script>

<template>
  <ScrollAreaRoot
    v-bind="delegatedProps"
    :class="cn('relative overflow-hidden', props.class)"
  >
    <ScrollAreaViewport
      as-child
      class="h-full w-full rounded-[inherit] focus:outline-none"
      @scroll="onScroll"
    >
      <slot></slot>
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
