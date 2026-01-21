<script setup lang="ts">
import { h, defineComponent } from 'vue';

const CustomIcon = defineComponent({
  render: () => h('div', { class: 'w-6 h-6 bg-purple-500 rounded-full' })
});
</script>

<template>
  <KunkkaIcon :icon="CustomIcon" />
</template>
