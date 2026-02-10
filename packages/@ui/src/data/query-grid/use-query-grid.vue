<template>
  <vxe-grid ref="gridRef" v-bind="$attrs" :size="props.size">
    <template v-for="name in (Object.keys($slots) as string[])" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </vxe-grid>
</template>

<script lang="ts" setup>
import { ref, useAttrs } from 'vue'
import { VxeGrid, type VxeGridInstance } from 'vxe-table'
import { VxeButton, VxePager } from 'vxe-pc-ui'
import 'vxe-table/lib/style.css'
import 'vxe-pc-ui/lib/style.css'
import { useSticky } from './sticky'
import './renderer'

const props = withDefaults(defineProps<{
  size?: 'medium' | 'small' | 'mini'
}>(), {
  size: 'small'
})

const gridRef = ref<VxeGridInstance>()
const attrs = useAttrs()

useSticky(gridRef, attrs)

defineOptions({
  components: {
    VxePager,
    VxeButton
  }
})

defineExpose({
  getGrid: () => gridRef.value
})
</script>

<style>
/* fix:全屏时出现两个滚动条 */
.vxe-grid.is--maximize .vxe-grid--layout-body-content-wrapper {
  overflow: hidden;
}
</style>
