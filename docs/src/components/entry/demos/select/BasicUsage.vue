<template>
  <div class="p-4">
    <kunkka-batch-select
      v-model="value"
      :options="options"
      placeholder="请选择 (支持全选/粘贴)"
      style="width: 320px"
    />
    <div class="mt-4 text-sm text-gray-500">
      Selected Value: {{ value }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { KunkkaBatchSelect } from '@sunny-base-web/ui';

const value = ref([]);
const options = Array.from({ length: 10 }).map((_, index) => ({
  label: `Option ${index + 1}`,
  value: index + 1,
}));
</script>
