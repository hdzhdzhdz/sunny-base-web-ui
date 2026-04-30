<script setup lang="ts">
import { ref } from 'vue'
import { Form, FormItem, Select, Option, InputNumber, Message } from '@arco-design/web-vue'
import type { ExportColumnConfig, ExportUserWebConfig } from '../export-modal/types'
import type { TableColumnInfo } from './types'
import { tableColumnsToExportList } from './types'
import { DEFAULT_FORM_COMMON_CONFIG } from '../../entry/form/config'
import { useSunnyModal } from '../modal'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

interface Props {
  exportUrl?: string | null
  customExportUrl?: string
  conditionMap?: Record<string, any>
  tableColumns?: TableColumnInfo[]
  exportUserWebConfig?: ExportUserWebConfig
}

const props = withDefaults(defineProps<Props>(), {
  exportUrl: ''
})

const emit = defineEmits<{
  'export-success': [response: any]
  'export-error': [error: any]
  close: []
}>()

const tableData = ref<ExportColumnConfig[]>([])
const currentExportUserWebConfig = ref<ExportUserWebConfig>({})

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

const [SunnyModal, modalApi] = useSunnyModal({
  title: t('common.exportModal.title'),
  width: 700,
  closeOnClickModal: false,
  onBeforeOk: async () => {
    try {
      const requestData = {
        conditionMap: props.conditionMap || {},
        exportList: tableData.value,
        exportUserWebConfig: currentExportUserWebConfig.value,
      }
      const apiPrefix = DEFAULT_FORM_COMMON_CONFIG.apiPrefix
      const exportFullUrl = props.customExportUrl
        ? `${props.customExportUrl}`
        : `${apiPrefix}${props.exportUrl}/export/exportExecuteStream`

      const adapter = DEFAULT_FORM_COMMON_CONFIG.exportAdapter
      let response: any
      if (adapter) {
        response = await adapter.export(exportFullUrl, requestData)
      } else {
        const axios = (await import('axios')).default
        response = await axios.post(exportFullUrl, requestData, { responseType: 'blob' })
      }

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
        emit('export-success', response)
      }
      fileReader.readAsText(response.data)
    } catch (error: any) {
      Message.error(error.message)
      emit('export-error', error)
      return false
    }
  },
  onClose: () => {
    emit('close')
  }
})

const open = () => {
  if (props.tableColumns && props.tableColumns.length > 0) {
    tableData.value = tableColumnsToExportList(props.tableColumns)
  }
  currentExportUserWebConfig.value = props.exportUserWebConfig || {}
  modalApi.open()
}

const close = () => {
  modalApi.close()
}

defineExpose({
  open,
  close
})

const handleRowDragEnd = ({ newIndex, oldIndex }: any) => {
  const row = tableData.value.splice(oldIndex, 1)[0]
  tableData.value.splice(newIndex, 0, row)
}
</script>

<template>
  <SunnyModal>
    <Form :model="currentExportUserWebConfig" layout="inline">
      <FormItem v-if="currentExportUserWebConfig.showSheetRowNum" :label="t('common.exportModal.showSheetRowNum')">
        <Select v-model="currentExportUserWebConfig.nSheetRowNum" :placeholder="currentExportUserWebConfig.hintSheetRowNum" allow-clear>
          <Option v-for="item in sheetRowNumOpts" :key="item.value" :label="item.label" :value="item.value" />
        </Select>
      </FormItem>
      <FormItem v-if="currentExportUserWebConfig.showMaxExportNumber" :label="t('common.exportModal.showMaxExportNumber')">
        <InputNumber v-model="currentExportUserWebConfig.maxExportNumber" :placeholder="currentExportUserWebConfig.hintMaxExportNumber" />
      </FormItem>
    </Form>

    <vxe-table
      size="mini"
      :data="tableData"
      border
      max-height="500"
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
  </SunnyModal>
</template>
