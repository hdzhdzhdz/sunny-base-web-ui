<script setup lang="ts">
import type { Component } from 'vue';

import { computed } from 'vue';

import { IconDefault, IconifyIcon } from '@sunny-base-web/icons';
import {
  isFunction,
  isHttpUrl,
  isObject,
  isString,
} from '@sunny-base-web/utils';

import type { SunnyIconProps } from './types';

defineOptions({
  name: 'SunnyIcon',
});

const props = defineProps<SunnyIconProps>();

/**
 * 判断是否为远程图标（通过 URL 加载）
 * 使用 isHttpUrl 确保只允许 http/https 协议，防止 XSS 风险
 */
const isRemoteIcon = computed(() => {
  return isString(props.icon) && isHttpUrl(props.icon);
});

/**
 * 判断是否为组件类型（Vue 组件或函数）
 */
const isComponent = computed(() => {
  const { icon } = props;
  return !isString(icon) && (isObject(icon) || isFunction(icon));
});
</script>

<template>
  <component :is="icon as Component" v-if="isComponent" v-bind="$attrs" />
  <img v-else-if="isRemoteIcon" :src="icon as string" v-bind="$attrs" />
  <IconifyIcon v-else-if="icon" v-bind="$attrs" :icon="icon as string" />
  <IconDefault v-else-if="fallback" v-bind="$attrs" />
</template>
