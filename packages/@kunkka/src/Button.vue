<script setup lang="ts">
defineProps<{
  label: string;
  primary?: boolean;
}>();
</script>

<template>
  <button
    :class="[
      'px-4 py-2 rounded font-medium',
      primary ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
    ]"
  >
    {{ label }}
  </button>
</template>
