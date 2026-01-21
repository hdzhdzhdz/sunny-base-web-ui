<template>
  <div class="p-4 space-y-8">
    <div>
      <h3 class="mb-2 font-bold text-lg">Both (Default)</h3>
      <p class="mb-2 text-sm text-gray-500">同时匹配 Label 或 Value。尝试复制 "Option 1" 或 "1"</p>
      <kunkka-batch-select
        v-model="value1"
        :options="options"
        match-strategy="both"
        placeholder="Match Label or Value"
        style="width: 100%"
      />
      <div class="mt-2 text-sm text-gray-500">Selected: {{ value1 }}</div>
    </div>

    <div>
      <h3 class="mb-2 font-bold text-lg">Label Only</h3>
      <p class="mb-2 text-sm text-gray-500">仅匹配 Label。尝试复制 "Option 2" (成功) vs "2" (忽略)</p>
      <kunkka-batch-select
        v-model="value2"
        :options="options"
        match-strategy="label"
        placeholder="Match Label Only"
        style="width: 100%"
      />
      <div class="mt-2 text-sm text-gray-500">Selected: {{ value2 }}</div>
    </div>

    <div>
      <h3 class="mb-2 font-bold text-lg">Value Only</h3>
      <p class="mb-2 text-sm text-gray-500">仅匹配 Value。尝试复制 "3" (成功) vs "Option 3" (忽略)</p>
      <kunkka-batch-select
        v-model="value3"
        :options="options"
        match-strategy="value"
        placeholder="Match Value Only"
        style="width: 100%"
      />
      <div class="mt-2 text-sm text-gray-500">Selected: {{ value3 }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { KunkkaBatchSelect } from '@kunkka/ui';

const value1 = ref([]);
const value2 = ref([]);
const value3 = ref([]);

const options = Array.from({ length: 5 }).map((_, index) => ({
  label: `Option ${index + 1}`,
  value: String(index + 1),
}));
</script>
