<template>
  <div class="my-filter-complex">
    <VxeSelect v-model="filterValue" v-if="renderType === 'select'" :options="column.params.optionlist" />
    <VxeInput v-model="filterValue" v-else @keyup.enter="confirmEvent" />
    <div class="my-fc-footer">
      <vxe-button @click="resetEvent">重置</vxe-button>
      <vxe-button status="primary" @click="confirmEvent">确认</vxe-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { hasIn } from 'lodash-es'
import { ref, computed } from 'vue'
import { VxeButton, VxeInput, VxeSelect } from 'vxe-pc-ui'

const filterValue = ref('')
const props = defineProps<{
  renderOpts: any
  renderParams: any
}>()

const column = computed(() => {
  return props.renderOpts.column
})

const renderType = computed(() => {
  return hasIn(column.value.params, 'optionlist') ? 'select' : 'input'
})

const confirmEvent = () => {
  const $grid = props.renderOpts.$grid
  // 触发对应的 ajax.query
  $grid.commitProxy('query', { [column.value.field]: filterValue.value })
  // 手动关闭筛选面板
  $grid.closeFilter()
}

const resetEvent = () => {
  const $grid = props.renderOpts.$grid
  // 触发对应的 ajax.query
  $grid.commitProxy('query', {})
  // 手动关闭筛选面板
  $grid.closeFilter()
}
</script>

<style lang="scss" scoped>
.my-filter-complex {
  // width: 260px;
  padding: 5px;
  .my-fc-type {
    padding: 8px 0;
  }
  .my-fc-input {
    width: 100%;
  }
  .my-fc-footer {
    text-align: center;
    margin-top: 8px;
  }
}
</style>
