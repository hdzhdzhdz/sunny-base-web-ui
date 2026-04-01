<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@sunny-base-web/stores';
import type { AccessControlProps, AccessControlSlots } from './types';

const props = withDefaults(defineProps<AccessControlProps>(), {
  codes: () => [],
  type: 'code',
});

const emit = defineEmits<{
  change: [visible: boolean];
}>();

defineSlots<AccessControlSlots>();

const userStore = useUserStore();

// 同步权限判断 - 工号
const hasCodePermission = computed(() => {
  if (!props.codes?.length) return true;
  return props.codes.includes(userStore.code);
});

// 同步权限判断 - 角色
const hasRolePermission = computed(() => {
  if (!props.codes?.length) return true;
  return props.codes.some((code) => userStore.roles.includes(code));
});

// 最终权限判断
const isVisible = computed(() => {
  // 1. 自定义方法优先
  if (props.authorize) {
    return props.authorize();
  }

  // 2. 按类型判断
  if (props.type === 'code') {
    return hasCodePermission.value;
  } else {
    return hasRolePermission.value;
  }
});

// 触发变化事件
emit('change', isVisible.value);
</script>

<template>
  <slot v-if="isVisible" />
  <slot v-else name="fallback" />
</template>
