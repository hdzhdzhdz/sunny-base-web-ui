<script setup lang="ts">
import { ref } from 'vue';
import { Menu } from '@kunkka/ui';
import type { MenuRecordRaw } from '@kunkka/ui';
import LayoutSidebar from './components/layout-sidebar.vue';

interface Props {
  menus?: MenuRecordRaw[];
  theme?: string;
}

const props = withDefaults(defineProps<Props>(), {
  menus: () => [],
  theme: 'dark',
});

const collapse = ref(false);
const expandOnHover = ref(false);
const expandOnHovering = ref(false);
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-background">
    <LayoutSidebar
      v-model:collapse="collapse"
      v-model:expand-on-hover="expandOnHover"
      v-model:expand-on-hovering="expandOnHovering"
      :theme="theme"
      :width="220"
      :collapse-width="48"
      :header-height="48"
    >
      <Menu
        :menus="menus"
        :collapse="collapse"
        :theme="theme"
        class="h-full w-full border-none"
      />
    </LayoutSidebar>
    
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/20">
      <div class="flex-1 overflow-auto p-4">
        <slot></slot>
      </div>
    </main>
  </div>
</template>
