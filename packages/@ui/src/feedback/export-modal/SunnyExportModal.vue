<script setup lang="ts">
import { ref } from 'vue'
import { Modal, Form, FormItem, Select, Option, InputNumber, Button, Message } from '@arco-design/web-vue'
import axios from 'axios'
import type { ExportColumnConfig, ExportUserWebConfig } from './types'
import { DEFAULT_FORM_COMMON_CONFIG } from '../../entry/form/config'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

interface Props {
  exportUrl?: string | null
  nmodid?: number
  nButtonid?: number
  conditionMap?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
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
  { label: t('common.exportModal.default'), value: 'default' },
  { label: t('common.exportModal.varchar'), value: 'varchar' },
  { label: t('common.exportModal.number'), value: 'number' },
  { label: t('common.exportModal.date'), value: 'date' }
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
      Message.error(response.data.message)
    }
  } catch (error: any) {
    Message.error(error.message)
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
    Message.error(error.message)
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
    :title="t('common.exportModal.title')"
    :width="700"
    :mask-closable="false"
    @cancel="handleCancel"
  >
    <Form :model="exportUserWebConfig" layout="inline">
      <FormItem v-if="exportUserWebConfig.showSheetRowNum" :label="t('common.exportModal.showSheetRowNum')">
        <Select v-model="exportUserWebConfig.nSheetRowNum" :placeholder="exportUserWebConfig.hintSheetRowNum" allow-clear>
          <Option v-for="item in sheetRowNumOpts" :key="item.value" :label="item.label" :value="item.value" />
        </Select>
      </FormItem>
      <FormItem v-if="exportUserWebConfig.showMaxExportNumber" :label="t('common.exportModal.showMaxExportNumber')">
        <InputNumber v-model="exportUserWebConfig.maxExportNumber" :placeholder="exportUserWebConfig.hintMaxExportNumber" />
      </FormItem>
    </Form>

    <vxe-table
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
      <vxe-column :title="t('common.exportModal.nSfExport')" width="70" align="center">
        <template #default="{ row }">
          <vxe-checkbox v-model="row.nSfExport" size="small" :checked-value="1" :unchecked-value="0" />
        </template>
      </vxe-column>
      <vxe-column field="colName" :title="t('common.exportModal.colName')" align="center" />
      <vxe-column :title="t('common.exportModal.colWidth')" width="100" align="center">
        <template #default="{ row }">
          <InputNumber v-model="row.colWidth" size="small" />
        </template>
      </vxe-column>
      <vxe-column :title="t('common.exportModal.colDataType')" width="120" align="center">
        <template #default="{ row }">
          <Select v-model="row.colDataType" size="small">
            <Option v-for="item in colDataTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </Select>
        </template>
      </vxe-column>
      <vxe-column :title="t('common.exportModal.drag')" width="50" align="center" fixed="right" :dragSort="true" />
    </vxe-table>

    <template #footer>
      <Button @click="handleCancel">{{ t('common.modal.cancel') }}</Button>
      <Button type="primary" :loading="buttonLoading" @click="handleExport">{{ t('common.modal.confirm') }}</Button>
    </template>
  </Modal>
</template>