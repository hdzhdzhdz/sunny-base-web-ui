<script setup lang="ts">
import { arcoLocale } from '#/locales';
</script>

<template>
  <a-config-provider :locale="arcoLocale">
    <RouterView />
  </a-config-provider>
</template>
