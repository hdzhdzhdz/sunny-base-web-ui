<template>
  <div class="w-full my-mini-table">
    <a-table :data="tableData" :bordered="true" :pagination="false" size="small" cellStyle="{ padding: '8px 0' }">
      <template #columns>
        <a-table-column :width="30" fixed="left">
          <template #title>
            <icon-plus-circle
              :style="{ fontSize: '16px', cursor: 'pointer' }"
              @click="tableData.push({ label: '', name: '', cArea: [] })"
            />
          </template>
          <template #cell="{ record, rowIndex }">
            <icon-minus-circle
              :style="{ fontSize: '16px', cursor: 'pointer' }"
              @click="tableData.splice(rowIndex, 1)"
            />
          </template>
        </a-table-column>
        <a-table-column title="选项卡标题" :width="110">
          <template #cell="{ record }">
            <a-input v-model="record.label" size="mini" style="width: 100%;" />
          </template>
        </a-table-column>
        <a-table-column title="选项卡标识符" :width="120">
          <template #cell="{ record }">
            <a-input v-model="record.name" size="mini" style="width: 100%;" />
          </template>
        </a-table-column>
        <a-table-column title="选项卡子区域">
          <template #cell="{ record }">
            <a-table :data="record.cArea" :bordered="true" :pagination="false" size="mini">
              <template #columns>
                <a-table-column title="子区域名称" :width="100">
                  <template #cell="{ record: childRecord }">
                    <a-input v-model="childRecord.label" size="mini" style="width: 100%;" />
                  </template>
                </a-table-column>
                <a-table-column title="子区域标识符" :width="110">
                  <template #cell="{ record: childRecord }">
                    <a-input v-model="childRecord.value" size="mini" style="width: 100%;" />
                  </template>
                </a-table-column>
                <a-table-column title="子区域类型" :width="100">
                  <template #cell="{ record: childRecord }">
                    <a-select v-model="childRecord.type" size="mini" style="width: 100%;">
                      <a-option value="form">表单</a-option>
                      <a-option value="table">表格</a-option>
                    </a-select>
                  </template>
                </a-table-column>
                <a-table-column title="操作" :width="50" align="center">
                  <template #title>
                    <icon-plus-circle
                      :style="{ fontSize: '16px', cursor: 'pointer' }"
                      @click="record.cArea.push({})"
                    />
                  </template>
                  <template #cell="{ rowIndex: childIndex }">
                    <icon-minus-circle
                      :style="{ fontSize: '16px', cursor: 'pointer' }"
                      @click="record.cArea.splice(childIndex, 1)"
                    />
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { IconPlusCircle, IconMinusCircle } from '@arco-design/web-vue/es/icon'

interface TabItem {
  label: string
  name: string
  cArea: SubAreaItem[]
}

interface SubAreaItem {
  label?: string
  value?: string
  type?: string
}

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const tableData = ref<TabItem[]>(props.modelValue ? JSON.parse(props.modelValue) : [])

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