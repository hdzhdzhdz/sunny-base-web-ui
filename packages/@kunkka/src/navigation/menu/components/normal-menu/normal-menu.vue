<script setup lang="ts">
import type { MenuRecordRaw } from '../../types';

import type { NormalMenuProps } from './normal-menu';

import { useNamespace } from '@utils';
import { KunkkaIcon } from '@kunkka/ui';

interface Props extends NormalMenuProps {}

defineOptions({
  name: 'NormalMenu',
});

const props = withDefaults(defineProps<Props>(), {
  activePath: '',
  collapse: false,
  menus: () => [],
  theme: 'dark',
});

const emit = defineEmits<{
  enter: [MenuRecordRaw];
  select: [MenuRecordRaw];
}>();

const { b, e, is } = useNamespace('normal-menu');

function menuIcon(menu: MenuRecordRaw) {
  return props.activePath === menu.path
    ? menu.activeIcon || menu.icon
    : menu.icon;
}
</script>

<template>
  <ul
    :class="[
      theme,
      b(),
      is('collapse', collapse),
      is(theme, true),
      is('rounded', rounded),
    ]"
    class="relative"
  >
    <template v-for="menu in menus" :key="menu.path">
      <li
        :class="[e('item'), is('active', activePath === menu.path)]"
        @click="() => emit('select', menu)"
        @mouseenter="() => emit('enter', menu)"
      >
        <KunkkaIcon :class="e('icon')" :icon="menuIcon(menu)" fallback />

        <span :class="e('name')" class="truncate"> {{ menu.name }}</span>
      </li>
    </template>
  </ul>
</template>
<style lang="scss" scoped>
$namespace: kunkka;

.#{$namespace}-normal-menu {
  --menu-item-margin-y: 4px;
  --menu-item-margin-x: 0px;
  --menu-item-padding-y: 9px;
  --menu-item-padding-x: 0px;
  --menu-item-radius: 0px;

  height: calc(100% - 4px);

  &.is-rounded {
    --menu-item-radius: 6px;
    --menu-item-margin-x: 8px;
  }

  &.is-dark {
    .#{$namespace}-normal-menu__item {
      // @apply text-foreground/80;
      color: hsl(var(--foreground) / 80%);

      &:not(.is-active):hover {
        // @apply text-foreground;
        color: hsl(var(--foreground));
      }

      &.is-active {
        .#{$namespace}-normal-menu__name,
        .#{$namespace}-normal-menu__icon {
          // @apply text-foreground;
          color: hsl(var(--foreground));
        }
      }
    }
  }

  &.is-collapse {
    .#{$namespace}-normal-menu__name {
      width: 0;
      height: 0;
      margin-top: 0;
      overflow: hidden;
      opacity: 0;
    }

    .#{$namespace}-normal-menu__icon {
      font-size: calc(var(--font-size-base, 16px) * 1.25);
    }
  }

  &__item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    // max-width: 64px;
    // max-height: 64px;
    padding: var(--menu-item-padding-y) var(--menu-item-padding-x);
    margin: var(--menu-item-margin-y) var(--menu-item-margin-x);
    color: hsl(var(--foreground) / 90%);
    cursor: pointer;
    border-radius: var(--menu-item-radius);
    transition:
      background 0.15s ease,
      padding 0.15s ease,
      border-color 0.15s ease;

    &.is-active {
      // @apply bg-primary text-primary dark:bg-accent;
      background-color: hsl(var(--primary));
      color: hsl(var(--primary));

      :global(.dark) & {
        background-color: hsl(var(--accent));
      }

      .#{$namespace}-normal-menu__name,
      .#{$namespace}-normal-menu__icon {
        // @apply font-semibold text-primary-foreground;
        font-weight: 600;
        color: hsl(var(--primary-foreground));
      }
    }

    &:not(.is-active):hover {
      // @apply bg-heavy text-primary dark:bg-accent dark:text-foreground;
      background-color: hsl(var(--accent));
      color: hsl(var(--primary));

      :global(.dark) & {
        background-color: hsl(var(--accent));
        color: hsl(var(--foreground));
      }
    }

    &:hover {
      .#{$namespace}-normal-menu__icon {
        transform: scale(1.2);
      }
    }
  }

  &__icon {
    max-height: 20px;
    font-size: calc(var(--font-size-base, 16px) * 1.25);
    transition: all 0.25s ease;
  }

  &__name {
    margin-top: 8px;
    margin-bottom: 0;
    font-size: calc(var(--font-size-base, 16px) * 0.75);
    font-weight: 400;
    transition: all 0.25s ease;
  }
}
</style>
