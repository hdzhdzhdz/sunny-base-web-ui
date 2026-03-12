<template>
  <div class="page-body">
    <ResourceManagement :app-system="appSystem" />
  </div>
</template>

<script setup lang="ts">
import { ResourceManagement } from '@sunny-base-web/effects';

const appSystem = import.meta.env.VITE_APP_SYSTEM ? JSON.parse(import.meta.env.VITE_APP_SYSTEM) : [];

defineOptions({ name: 'ResourceManagement' })
</script>
