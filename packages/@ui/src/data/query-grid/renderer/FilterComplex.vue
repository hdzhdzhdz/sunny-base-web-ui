<template>
  <div class="my-filter-complex">
    <div v-if="currOption" class="my-filter-input">
      <VxeSelect
        v-if="renderType === 'select' && column"
        v-model="currOption.data"
        :options="column.params.optionlist"
        clearable
        @change="changeOptionEvent"
      />
      <VxeInput
        v-else
        v-model="currOption.data"
        clearable
        @keyup.enter="confirmEvent"
        @input="changeOptionEvent"
      />
    </div>
    <div class="my-fc-footer">
      <vxe-button @click="resetEvent">重置</vxe-button>
      <vxe-button status="primary" @click="confirmEvent">确认</vxe-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import type { PropType } from 'vue'
import { VxeTableDefines } from 'vxe-table'
import type { VxeGlobalRendererHandles } from 'vxe-table'
import { VxeButton, VxeInput, VxeSelect } from 'vxe-pc-ui'
import { hasIn } from 'lodash-es'

const props = defineProps({
  renderOpts: Object as PropType<VxeGlobalRendererHandles.RenderTableFilterOptions>,
  renderParams: Object as PropType<VxeGlobalRendererHandles.RenderTableFilterParams>
})

const currOption = ref<VxeTableDefines.FilterOption>()
const currField = computed(() => {
  const { column } = props.renderParams || {}
  return column ? column.field : ''
})

const load = () => {
  const { renderParams } = props
  if (renderParams) {
    const { column } = renderParams
    const option = column.filters[0]
    currOption.value = option
  }
}

watch(currField, () => {
  load()
})

load()

const column = computed(() => {
  return props.renderParams?.column
})

const renderType = computed(() => {
  const col = column.value
  return col && hasIn(col.params, 'optionlist') ? 'select' : 'input'
})

const changeOptionEvent = () => {
  const { renderParams } = props
  const option = currOption.value
  if (renderParams && option) {
    const { $table } = renderParams
    const checked = !!option.data
    $table.updateFilterOptionStatus(option, checked)
  }
}

// 获取所有筛选条件参数
const getFilterParams = () => {
  const { renderParams } = props
  const params: Record<string, any> = {}
  if (renderParams) {
    const { $table } = renderParams
    const columns = $table.getColumns()
    columns.forEach((column) => {
      const { field, filters } = column
      if (field && filters && filters.length) {
        const option = filters[0]
        if (option.data) {
          params[field] = option.data
        }
      }
    })
  }
  return params
}

const confirmEvent = () => {
  const { renderParams } = props
  if (renderParams) {
    // @ts-ignore
    const { $table, $grid } = renderParams
    const option = currOption.value
    if (option) {
      $table.updateFilterOptionStatus(option, !!option.data)
    }
    const params = getFilterParams()
    // 触发对应的 ajax.query
    $grid.commitProxy('query', params)
    // 手动关闭筛选面板
    $grid.closeFilter()
  }
}

const resetEvent = () => {
  const { renderParams } = props
  const option = currOption.value
  if (renderParams && option) {
    // @ts-ignore
    const { $table, $grid } = renderParams
    // 重置筛选条件
    option.data = ''
    $table.updateFilterOptionStatus(option, false)
    const params = getFilterParams()
    // 触发对应的 ajax.query
    $grid.commitProxy('query', params)
    // 手动关闭筛选面板
    $grid.closeFilter()
  }
}
</script>

<style lang="scss" scoped>
.my-filter-complex {
  padding: 5px;
  .my-fc-footer {
    text-align: center;
    margin-top: 8px;
  }
}
</style>
