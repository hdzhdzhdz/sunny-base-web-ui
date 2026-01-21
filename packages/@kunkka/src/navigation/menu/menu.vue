<script setup lang="ts">
import { useForwardProps } from "reka-ui";
import type { MenuProps, MenuRecordRaw } from "./types";
import { Menu } from './components';
import SubMenu from './sub-menu.vue';

interface Props extends MenuProps {
  menus: MenuRecordRaw[];
}

defineOptions({
  name: "MenuView",
});

const props = withDefaults(defineProps<Props>(), {
  collapse: false,
});

const forward = useForwardProps(props);
</script>

<template>
  <Menu v-bind="forward">
    <SubMenu v-for="menu in menus" :key="menu.path" :menu="menu" />
  </Menu>
</template>
