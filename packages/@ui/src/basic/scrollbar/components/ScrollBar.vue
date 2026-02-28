<script setup lang="ts">
import type { ScrollAreaScrollbarProps } from 'reka-ui';

import { computed } from 'vue';

import { cn } from '@sunny-base-web/utils';

import { ScrollAreaScrollbar, ScrollAreaThumb } from 'reka-ui';

defineOptions({
  name: 'SunnyScrollBar',
});

/** 类名类型 */
type ClassType = string | string[] | Record<string, boolean>;

const props = withDefaults(
  defineProps<
    ScrollAreaScrollbarProps & {
      /** 自定义类名 */
      class?: ClassType;
    }
  >(),
  {
    orientation: 'vertical',
  },
);

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <ScrollAreaScrollbar
    v-bind="delegatedProps"
    :class="
      cn(
        'flex touch-none select-none transition-colors',
        orientation === 'vertical' &&
          'h-full w-2.5 border-l border-l-transparent p-px',
        orientation === 'horizontal' &&
          'h-2.5 flex-col border-t border-t-transparent p-px',
        props.class,
      )
    "
  >
    <ScrollAreaThumb class="relative flex-1 rounded-full bg-border" />
  </ScrollAreaScrollbar>
</template>
