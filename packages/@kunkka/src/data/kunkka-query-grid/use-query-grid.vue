<template>
  <vxe-grid ref="gridRef" v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
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
