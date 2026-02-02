<template>
  <a-breadcrumb class="ml-4">
    <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
      <span v-if="shouldShowText(item)" class="text-[var(--color-text-1)]">
        {{ item.meta?.title }}
      </span>
      <a v-else @click.prevent="handleLink(item)" class="cursor-pointer text-[var(--color-text-2)] hover:text-[var(--color-text-1)] transition-colors">
        {{ item.meta?.title }}
      </a>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter, type RouteLocationMatched } from 'vue-router';

defineOptions({ name: 'HeaderBreadcrumb' });

const route = useRoute();
const router = useRouter();

const breadcrumbs = computed(() => {
  return route.matched.filter((item) => item.meta && item.meta.title && !item.meta.hideInBreadcrumb);
});

const shouldShowText = (item: RouteLocationMatched) => {
  // Show text (not link) if:
  // 1. It's the last item (current page)
  // 2. It has no redirect and no children (conceptually) or is explicitly set to no redirect
  // 3. It matches the current path exactly
  return item.path === route.path || item.redirect === 'noRedirect';
};

const handleLink = (item: RouteLocationMatched) => {
  const { redirect, path } = item;
  if (redirect) {
    router.push(redirect as string);
    return;
  }
  router.push(path);
};
</script>
