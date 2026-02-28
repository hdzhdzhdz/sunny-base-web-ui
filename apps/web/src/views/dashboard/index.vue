<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold">
      {{ $t('base.hello') }}
      {{ $t('base.欢迎来到') }}
      {{ $t('base.dashboard') }}
    </h1>
    <a-date-picker
      default-value="2019-06-03"
      hide-trigger
      style="width: 268px;"
    />
    <a-pagination :total="50" show-total show-jumper show-page-size/>
  </div>
</template>

<script setup lang="ts">
</script>
