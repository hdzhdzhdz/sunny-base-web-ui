<template>
  <a-modal
    v-model:visible="visible"
    :mask-closable="false"
    :unmount-on-close="true"
    draggable
    title="Meta"
    width="600px"
  >
    <a-textarea
      v-model="json"
      allow-clear
      :autoSize="{
        minRows: 5,
        maxRows: 10
      }"
    />
    <template #footer>
      <a-space>
        <a-button @click="visible = false">取 消</a-button>
        <a-button type="primary" @click="handleOk">确 定</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  metaEmit: [{ rowIndex: number, json: string }]
}>()

const visible = ref(false)
const json = ref('')
const rowIndex = ref<number | null>(null)

const openInit = ({ row, rowIndex: index }: { row: any, rowIndex: number }) => {
  visible.value = true
  rowIndex.value = index
  json.value = JSON.stringify(JSON.parse(row.cMeta || '{}'), null, 2)
}

const handleOk = () => {
  emit('metaEmit', {
    rowIndex: rowIndex.value!,
    json: JSON.stringify(JSON.parse(json.value))
  })
  visible.value = false
}

defineExpose({
  openInit
})
</script>

<style lang="scss" scoped>
</style>
