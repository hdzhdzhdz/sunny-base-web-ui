<template>
  <div class="w-full my-mini-table">
    <a-table :data="tableData" :bordered="true" :pagination="false" size="small">
      <template #columns>
        <a-table-column :width="30" align="center">
          <template #title>
            <icon-plus-circle
              :style="{ fontSize: '16px', cursor: 'pointer' }"
              @click="tableData.push({ label: '', name: '', type: '', cArea: [] })"
            />
          </template>
          <template #cell="{ record, rowIndex }">
            <icon-minus-circle
              :style="{ fontSize: '16px', cursor: 'pointer' }"
              @click="tableData.splice(rowIndex, 1)"
            />
          </template>
        </a-table-column>
        <a-table-column title="选项卡标题" :width="200">
          <template #cell="{ record }">
            <a-input v-model="record.label" size="small" style="width: 100%;" />
          </template>
        </a-table-column>
        <a-table-column title="选项卡标识符" :width="200">
          <template #cell="{ record }">
            <a-input v-model="record.name" size="small" style="width: 100%;" />
          </template>
        </a-table-column>
        <a-table-column title="选项卡区域类型">
          <template #cell="{ record }">
            <a-select v-model="record.type" size="small" style="width: 100%;">
              <a-option value="form">表单</a-option>
              <a-option value="table">表格</a-option>
            </a-select>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { IconPlusCircle, IconMinusCircle } from '@arco-design/web-vue/es/icon'

interface FormTabItem {
  label: string
  name: string
  type: string
  cArea: any[]
}

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const tableData = ref<FormTabItem[]>(props.modelValue ? JSON.parse(props.modelValue) : [])

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== undefined) {
      tableData.value = JSON.parse(newValue)
    }
  }
)

watch(
  tableData,
  (v) => {
    emit('update:modelValue', JSON.stringify(v))
  },
  { deep: true }
)
</script>

<style lang="scss">
.my-mini-table {
  .arco-table-cell {
    padding: 5px 8px;
  }
}
</style>