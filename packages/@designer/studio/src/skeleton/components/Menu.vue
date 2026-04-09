<script setup lang="ts">
import { computed } from 'vue'
import type { MaskMenu } from '../types'

defineOptions({ name: 'MaskMenu' })

const props = withDefaults(defineProps<{
  menus?: MaskMenu[]
  collapsed?: boolean
  selectedKey?: string
}>(), {
  menus: () => [],
  collapsed: false,
})

const emit = defineEmits<{
  (e: 'menuClick', menu: MaskMenu): void
}>()

const openKeys = computed(() => {
  const keys: string[] = []
  const findParent = (items: MaskMenu[], target: string, parents: string[] = []): string[] | null => {
    for (const item of items) {
      if (item.key === target) return parents
      if (item.children) {
        const found = findParent(item.children, target, [...parents, item.key])
        if (found) return found
      }
    }
    return null
  }
  if (props.selectedKey) {
    const parents = findParent(props.menus, props.selectedKey)
    if (parents) keys.push(...parents)
  }
  return keys
})

const handleClick = (menu: MaskMenu) => {
  emit('menuClick', menu)
}
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <a-menu
      :selected-keys="selectedKey ? [selectedKey] : []"
      :open-keys="openKeys"
      :collapsed="collapsed"
      :auto-open-selected="true"
      :accordion="false"
      @menu-item-click="(key: string) => {
        const find = (items: MaskMenu[]): MaskMenu | undefined => {
          for (const item of items) {
            if (item.key === key) return item
            if (item.children) {
              const found = find(item.children)
              if (found) return found
            }
          }
        }
        const menu = find(menus)
        if (menu) handleClick(menu)
      }"
    >
      <template v-for="item in menus" :key="item.key">
        <!-- 有子菜单 -->
        <a-sub-menu v-if="item.children?.length" :key="item.key">
          <template #icon>
            <component :is="item.icon" v-if="item.icon" :size="16" />
          </template>
          <template #title>{{ item.label }}</template>
          <template v-for="child in item.children" :key="child.key">
            <a-sub-menu v-if="child.children?.length" :key="child.key">
              <template #icon>
                <component :is="child.icon" v-if="child.icon" :size="16" />
              </template>
              <template #title>{{ child.label }}</template>
              <a-menu-item v-for="grand in child.children" :key="grand.key">
                <template #icon>
                  <component :is="grand.icon" v-if="grand.icon" :size="16" />
                </template>
                {{ grand.label }}
              </a-menu-item>
            </a-sub-menu>
            <a-menu-item v-else :key="child.key">
              <template #icon>
                <component :is="child.icon" v-if="child.icon" :size="16" />
              </template>
              {{ child.label }}
            </a-menu-item>
          </template>
        </a-sub-menu>
        <!-- 无子菜单 -->
        <a-menu-item v-else :key="item.key">
          <template #icon>
            <component :is="item.icon" v-if="item.icon" :size="16" />
          </template>
          {{ item.label }}
        </a-menu-item>
      </template>
    </a-menu>
  </div>
</template>
