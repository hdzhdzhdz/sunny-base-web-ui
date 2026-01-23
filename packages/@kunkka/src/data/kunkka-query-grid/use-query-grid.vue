<template>
  <vxe-grid ref="gridRef" v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </vxe-grid>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { VxeGrid, type VxeGridInstance } from 'vxe-table'
import 'vxe-table/lib/style.css'
import 'vxe-pc-ui/lib/style.css'
import { useSticky } from './sticky'

const gridRef = ref<VxeGridInstance>()

useSticky(gridRef)

defineExpose({
  getGrid: () => gridRef.value
})
</script>
