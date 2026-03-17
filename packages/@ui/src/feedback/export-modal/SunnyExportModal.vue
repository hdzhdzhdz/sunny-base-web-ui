<script setup lang="ts">
import { ref } from 'vue'
import { Modal, Form, FormItem, Select, Option, InputNumber, Button, Message } from '@arco-design/web-vue'
import { VxeTable, VxeColumn } from 'vxe-table'
import axios from 'axios'
import type { ExportColumnConfig, ExportUserWebConfig } from './types'
import { DEFAULT_FORM_COMMON_CONFIG } from '../../entry/form/config'

interface Props {
  title?: string
  width?: string | number
  exportUrl?: string | null
  nmodid?: number
  nButtonid?: number
  conditionMap?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  title: '导出选项',
  width: '700px',
  exportUrl: ''
})

const emit = defineEmits<{
  'export-success': [response: any]
  'export-error': [error: any]
  close: []
}>()

const visible = ref(false)

const tableData = ref<ExportColumnConfig[]>([])
const exportUserWebConfig = ref<ExportUserWebConfig>({})
const loading = ref(false)
const buttonLoading = ref(false)

const colDataTypeList = [
  { label: '默认', value: 'default' },
  { label: '字符串', value: 'varchar' },
  { label: '数字', value: 'number' },
  { label: '日期', value: 'date' }
]

const sheetRowNumOpts = [
  { label: '10000', value: '10000' },
  { label: '20000', value: '20000' },
  { label: '50000', value: '50000' },
  { label: '100000', value: '100000' }
]

const initExportConfig = async () => {
  loading.value = true
  try {
    const response = await axios.post(`${DEFAULT_FORM_COMMON_CONFIG.apiPrefix}${props.exportUrl}/export/openInit`, {
      nmodid: props.nmodid,
      nButtonid: props.nButtonid
    })
    if (response.data.code === 200) {
      tableData.value = response.data.result.exportList
      exportUserWebConfig.value = response.data.result.exportUserWebConfig
      visible.value = true
    } else {
      Message.error(response.data.message || '初始化失败')
    }
  } catch (error: any) {
    Message.error(error.message || '初始化失败')
  } finally {
    loading.value = false
  }
}

const open = () => {
  initExportConfig()
}

const close = () => {
  visible.value = false
  emit('close')
}

defineExpose({
  open,
  close
})

const handleRowDragEnd = ({ newIndex, oldIndex }: any) => {
  const row = tableData.value.splice(oldIndex, 1)[0]
  tableData.value.splice(newIndex, 0, row)
}

const handleExport = async () => {
  buttonLoading.value = true
  try {
    tableData.value.forEach((item) => {
      if (item.colType === 'spanselect' && isNaN(Number(item.selId))) {
      }
    })

    const requestData = {
      conditionMap: props.conditionMap || {},
      exportList: tableData.value,
      exportUserWebConfig: exportUserWebConfig.value,
      nmodid: props.nmodid,
      nButtonid: props.nButtonid
    }
    
    const response = await axios.post(
      `${DEFAULT_FORM_COMMON_CONFIG.apiPrefix}${props.exportUrl}/export/exportExecuteStream`,
      requestData,
      {
        responseType: 'blob'
      }
    )

    const fileReader = new FileReader()
    fileReader.onload = function() {
      const fileName = response.headers['content-disposition']
        ?.split('attachment;filename=')[1]
      const blob = new Blob([response.data])
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = decodeURI(fileName || 'export.xlsx')
      link.click()
      URL.revokeObjectURL(link.href)
      close()
      emit('export-success', response)
    }
    fileReader.readAsText(response.data)
  } catch (error: any) {
    Message.error(error.message || '导出失败')
    emit('export-error', error)
  } finally {
    buttonLoading.value = false
  }
}

const handleCancel = () => {
  close()
}
</script>

<template>
  <Modal
    v-model:visible="visible"
    :title="title"
    :width="width"
    :mask-closable="false"
    @cancel="handleCancel"
  >
    <Form :model="exportUserWebConfig" layout="inline">
      <FormItem v-if="exportUserWebConfig.showSheetRowNum" label="页签最大行">
        <Select v-model="exportUserWebConfig.nSheetRowNum" :placeholder="exportUserWebConfig.hintSheetRowNum" allow-clear>
          <Option v-for="item in sheetRowNumOpts" :key="item.value" :label="item.label" :value="item.value" />
        </Select>
      </FormItem>
      <FormItem v-if="exportUserWebConfig.showMaxExportNumber" label="Excel最大导出行">
        <InputNumber v-model="exportUserWebConfig.maxExportNumber" :placeholder="exportUserWebConfig.hintMaxExportNumber" />
      </FormItem>
    </Form>

    <VxeTable
      size="mini"
      :data="tableData"
      border
      max-height="500"
      :loading="loading"
      :row-config="{
        drag: true
      }"
      @row-drag-end="handleRowDragEnd"
    >
      <VxeColumn title="是否导出" width="70" align="center">
        <template #default="{ row }">
          <vxe-checkbox v-model="row.nSfExport" size="small" :checked-value="1" :unchecked-value="0" />
        </template>
      </VxeColumn>
      <VxeColumn field="colName" title="列名" align="center" />
      <VxeColumn title="宽度" width="100" align="center">
        <template #default="{ row }">
          <InputNumber v-model="row.colWidth" size="small" />
        </template>
      </VxeColumn>
      <VxeColumn title="数据类型" width="120" align="center">
        <template #default="{ row }">
          <Select v-model="row.colDataType" size="small">
            <Option v-for="item in colDataTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </Select>
        </template>
      </VxeColumn>
      <VxeColumn title="拖拽" width="50" align="center" fixed="right" :dragSort="true" />
    </VxeTable>

    <template #footer>
      <Button @click="handleCancel">取消</Button>
      <Button type="primary" :loading="buttonLoading" @click="handleExport">确定</Button>
    </template>
  </Modal>
</template>