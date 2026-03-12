<script setup lang="ts">
import { arcoLocale } from '#/locales';
import { ErrorBoundary } from '@sunny-base-web/ui';
</script>

<template>
  <a-config-provider :locale="arcoLocale">
    <ErrorBoundary>
      <RouterView />
    </ErrorBoundary>
  </a-config-provider>
</template>
