<script setup lang="ts">
import { useArcoLocale } from "@kunkka/ui";
const { locale } = useArcoLocale();

</script>

<template>
  <a-config-provider :locale="locale">
    <RouterView />
  </a-config-provider>
</template>
