<!--
  * 递归菜单组件
  * 用于渲染多级嵌套的侧边栏菜单
  * @props menus - 菜单数据数组
-->
<template>
  <template v-for="item in menus" :key="item.path">
    <!-- 如果有子菜单，渲染为子菜单组 -->
    <a-sub-menu v-if="item.children && item.children.length > 0" :key="item.path">
      <template #title>
        <!-- 菜单图标 -->
        <span class="mr-2 inline-flex items-center" v-if="item.icon">
          <KunkkaIcon :icon="item.icon" />
        </span>
        <!-- 菜单标题 -->
        {{ item.name }}
      </template>
      <!-- 递归调用自身渲染子菜单 -->
      <MenuItem :menus="item.children" />
    </a-sub-menu>
    <!-- 如果没有子菜单，渲染为普通菜单项 -->
    <a-menu-item v-else :key="item.path">
      <template #icon v-if="item.icon">
        <KunkkaIcon :icon="item.icon" />
      </template>
      {{ item.name }}
    </a-menu-item>
  </template>
</template>

<script setup lang="ts">
import { defineOptions, defineProps } from 'vue';
import { KunkkaIcon } from '@kunkka/ui';

// 定义组件名称，便于递归调用和调试
defineOptions({ name: 'MenuItem' });

// 接收菜单数据 prop
defineProps<{
  menus: any[]
}>();
</script>
