<script setup lang="ts">
import { KunkkaScrollbar } from '@kunkka/ui';
</script>

<template>
  <div class="flex gap-4">
   <div class="h-[200px] w-[350px] rounded-md border p-4">
      <KunkkaScrollbar shadow class="h-full">
        <div class="space-y-4 p-4">
          <div v-for="i in 20" :key="i" class="text-sm">
            Content line {{ i }}
          </div>
        </div>
      </KunkkaScrollbar>
    </div> 
  </div>
</template>
