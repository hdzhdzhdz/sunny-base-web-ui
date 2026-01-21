<script setup lang="ts">
import { KunkkaScrollbar } from '@kunkka/ui';
</script>

<template>
  <div class="h-[100px] w-[350px] rounded-md border p-4">
    <KunkkaScrollbar horizontal class="h-full">
      <div class="flex w-[800px] gap-4 p-4">
        <div v-for="i in 10" :key="i" class="h-[50px] w-[100px] shrink-0 rounded bg-gray-100 p-2 text-sm flex items-center justify-center">
          Item {{ i }}
        </div>
      </div>
    </KunkkaScrollbar>
  </div>
</template>
