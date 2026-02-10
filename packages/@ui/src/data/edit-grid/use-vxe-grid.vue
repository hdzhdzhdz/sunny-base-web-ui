<template>
  <vxe-grid ref="gridRef" v-bind="$attrs">
    <template v-for="name in (Object.keys($slots) as string[])" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </vxe-grid>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { VxeGrid, type VxeGridInstance } from 'vxe-table'
import 'vxe-table/lib/style.css'

const gridRef = ref<VxeGridInstance>()

defineExpose({
  getGrid: () => gridRef.value
})
</script>
