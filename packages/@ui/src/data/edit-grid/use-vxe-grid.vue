<template>
  <a-config-provider size="small">
    <vxe-grid ref="gridRef" v-bind="$attrs">
      <template v-for="(slotData, name) of ($slots as Record<string, any>)" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}"></slot>
      </template>
    </vxe-grid>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { VxeGrid, type VxeGridInstance } from 'vxe-table'
import 'vxe-table/lib/style.css'
import './filters-combination'

const gridRef = ref<VxeGridInstance>()

defineExpose({
  getGrid: () => gridRef.value
})
</script>
