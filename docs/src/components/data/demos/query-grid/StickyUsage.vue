<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useKunkkaQueryGrid } from '@kunkka/ui';

const isSticky = ref(true);

const gridOptions = reactive({
  border: true,
  // 不设置 height，让表格自动撑开，以演示页面级滚动吸顶
  sticky: isSticky, 
  columns: [
    { type: 'seq', width: 60 },
    { field: 'name', title: 'Name' },
    { field: 'role', title: 'Role' },
    { field: 'date', title: 'Date' },
    { field: 'address', title: 'Address' }
  ],
  data: Array.from({ length: 50 }).map((_, i) => ({
    name: `Test Name ${i}`,
    role: 'Developer',
    date: '2024-01-01',
    address: `Address ${i}`
  }))
});

const [Grid] = useKunkkaQueryGrid({ gridOptions });
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <a-switch v-model="isSticky" />
      <span class="text-sm">开启表头吸顶 (Sticky Header)</span>
    </div>
    
    <div class="vp-raw">
      <!-- 为了演示吸顶，我们需要足够的内容让页面滚动 -->
      <Grid />
    </div>
  </div>
</template>
