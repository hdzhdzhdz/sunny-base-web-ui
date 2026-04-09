<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { SunnyMask } from '@sunny-base-web/designer-studio'
import type { MaskMenu, MaskTab, MaskAction } from '@sunny-base-web/designer-studio'

defineOptions({
  name: 'DesignPage',
})

const router = useRouter()

const collapsed = ref(false)
const activeTab = ref('design')

const menus = ref<MaskMenu[]>([
  {
    key: 'design',
    label: '设计器',
    path: '/design',
  },
  {
    key: 'preview',
    label: '预览',
    path: '/design/preview',
  },
])

const tabs = ref<MaskTab[]>([
  { key: 'design', label: '设计器', closable: false },
])

const actions = ref<MaskAction[]>([
  {
    key: 'settings',
    label: '设置',
  },
])

const handleMenuClick = (menu: MaskMenu) => {
  if (menu.path) {
    router.push(menu.path)
  }
}

const handleTabClick = (tab: MaskTab) => {
  activeTab.value = tab.key
}

const handleTabClose = (key: string) => {
  const index = tabs.value.findIndex((t) => t.key === key)
  if (index > -1) {
    tabs.value.splice(index, 1)
    if (activeTab.value === key && tabs.value.length > 0) {
      activeTab.value = tabs.value[tabs.value.length - 1].key
    }
  }
}
</script>

<template>
  <SunnyMask
    title="Sunny Designer"
    :menus="menus"
    :tabs="tabs"
    :actions="actions"
    v-model:collapsed="collapsed"
    v-model:active-tab="activeTab"
    @menu-click="handleMenuClick"
    @tab-click="handleTabClick"
    @tab-close="handleTabClose"
  >
    <div class="p-4">
      <h2 class="text-lg font-semibold mb-4">设计器</h2>
      <p class="text-gray-500">欢迎使用 Sunny Designer 设计器</p>
    </div>
  </SunnyMask>
</template>
