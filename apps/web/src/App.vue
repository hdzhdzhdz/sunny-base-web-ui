<script setup lang="ts">
import { arcoLocale } from '#/locales';
import { ErrorBoundary } from '@sunny-base-web/ui';
import { GlobalLoading } from '@sunny-base-web/effects';
import { preferences } from './preferences';

// 从配置中读取加载动画设置
const loadingConfig = preferences.transition.loading;
</script>

<template>
  <a-config-provider :locale="arcoLocale">
    <ErrorBoundary>
      <RouterView />
    </ErrorBoundary>
    <GlobalLoading
      :type="loadingConfig.type"
      :min-loading-time="loadingConfig.minLoadingTime"
    />
  </a-config-provider>
</template>
