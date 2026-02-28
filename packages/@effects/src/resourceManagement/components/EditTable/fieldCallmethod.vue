<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :width="800"
    :mask-closable="false"
  >
    <a-form ref="formRef" :model="form" :rules="getRules()" layout="vertical">
      <a-form-item label="导入/导出" field="callmethodType">
        <a-select v-model="form.callmethodType" placeholder="请选择">
          <a-option
            v-for="op in selectOpts.callmethodType"
            :key="op.value"
            :label="op.label"
            :value="op.value"
          />
        </a-select>
      </a-form-item>

      <template v-if="form.callmethodType === '导入'">
        <a-form-item label="模板名称(后端文件名)" field="import1">
          <a-input v-model="form.import1" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="导出文件名称(前端导出名称)" field="import2">
          <a-input v-model="form.import2" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="后端导入方法" field="import3">
          <a-input v-model="form.import3" placeholder="请输入" />
        </a-form-item>
      </template>

      <template v-if="form.callmethodType === '导出'">
        <a-form-item label="导出文件名" field="fileName">
          <a-input v-model="form.fileName" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="导出处理类前缀" field="handleClassPrefix">
          <a-input v-model="form.handleClassPrefix" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="导出类型" field="exportType">
          <a-select v-model="form.exportType" placeholder="请选择" allow-clear>
            <a-option
              v-for="op in selectOpts.exportType"
              :key="op.value"
              :label="op.label"
              :value="op.value"
            />
          </a-select>
        </a-form-item>
        <a-form-item label="是否自定义表头" field="bCustomTableHead">
          <a-select v-model="form.bCustomTableHead">
            <a-option :value="true">是</a-option>
            <a-option :value="false">否</a-option>
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="form.bCustomTableHead === true"
          label="自定义表头方法"
          field="customTableHeadFunc"
        >
          <a-select v-model="form.customTableHeadFunc">
            <a-option value="CUSTOM">自定义完全列</a-option>
            <a-option value="PART">修改部分</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="是否显示:单页签最大行数" field="showSheetRowNum">
          <a-switch v-model="form.showSheetRowNum" checked-text="是" unchecked-text="否" />
        </a-form-item>
        <a-form-item label="是否显示:Excel最大导出行数" field="showMaxExportNumber">
          <a-switch v-model="form.showMaxExportNumber" checked-text="是" unchecked-text="否" />
        </a-form-item>
      </template>
    </a-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <a-button @click="handleCancel">取 消</a-button>
        <a-button type="primary" :loading="loading" @click="handleOk">确 定</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import selectOpts from '../../../utils/select-options'
import { startsWith } from 'lodash-es'

interface FData {
  rowIndex: number | null
  field: string | null
  fieldDatas: any[]
}

interface FormDataType {
  callmethodType: string
  customType: string
  import1: string
  import2: string
  import3: string
  fileName: string
  handleClassPrefix: string
  exportType: string
  bCustomTableHead: boolean
  customTableHeadFunc: string
  showSheetRowNum: boolean
  showMaxExportNumber: boolean
}

const visible = ref(false)
const title = ref('')
const loading = ref(false)
const fData = reactive<FData>({
  rowIndex: null,
  field: null,
  fieldDatas: []
})

const form = reactive<FormDataType>({
  callmethodType: '',
  customType: '',
  import1: '',
  import2: '',
  import3: '',
  fileName: '',
  handleClassPrefix: '',
  exportType: '',
  bCustomTableHead: false,
  customTableHeadFunc: '',
  showSheetRowNum: false,
  showMaxExportNumber: false
})

const formRef = ref()
const registerModal = ref()

const emit = defineEmits<{
  fieldCallmethodEdit: [data: { rowIndex: number; json: string; field: string | null }]
}>()

const getRules = () => {
  const baseRules: any = {
    callmethodType: [{ required: true, message: '请选择', trigger: 'change' }]
  }

  if (form.callmethodType === '导入') {
    baseRules.import1 = [{ required: true, message: '请输入', trigger: 'blur' }]
    baseRules.import2 = [{ required: true, message: '请输入', trigger: 'blur' }]
    baseRules.import3 = [{ required: true, message: '请输入', trigger: 'blur' }]
  }

  if (form.callmethodType === '导出') {
    baseRules.fileName = [{ required: true, message: '请输入', trigger: 'blur' }]
    baseRules.handleClassPrefix = [{ required: true, message: '请输入', trigger: 'blur' }]
    baseRules.exportType = [{ required: true, message: '请选择', trigger: 'change' }]
    
    if (form.bCustomTableHead === true) {
      baseRules.customTableHeadFunc = [{ required: true, message: '请选择', trigger: 'change' }]
    }
  }

  return baseRules
}

const resetForm = () => {
  Object.assign(form, {
    callmethodType: '',
    customType: '',
    import1: '',
    import2: '',
    import3: '',
    fileName: '',
    handleClassPrefix: '',
    exportType: '',
    bCustomTableHead: false,
    customTableHeadFunc: '',
    showSheetRowNum: false,
    showMaxExportNumber: false
  })
}

const openInit = ({ row, rowIndex, column }: { row: any; rowIndex: number; column: any; tableData: any[] }) => {
  fData.rowIndex = rowIndex
  fData.field = column.field
  resetForm()

  if (row[column.field]) {
    const fieldValue = row[column.field]
    
    if (fieldValue.indexOf('@') !== -1) {
      const beforeStr = fieldValue.split('@')[0]
      
      if (beforeStr.indexOf(',') !== -1) {
        if (startsWith(fieldValue, '{')) {
          Object.assign(form, JSON.parse(fieldValue))
        } else {
          form.callmethodType = '导出'
          form.customType = '是'
          form.fileName = fieldValue.split(',')[0]
          
          if (fieldValue.split(',').length === 3) {
            form.handleClassPrefix = fieldValue.split(',')[1]
            form.exportType = fieldValue.split(',')[2] === 'ALL' ? '一次性批量导出' : '自定义格式导出'
          } else {
            form.handleClassPrefix = fieldValue.split(',')[1]
            form.exportType = '流式导出'
          }
        }
      } else {
        form.callmethodType = '导入'
        form.import1 = fieldValue.split(',')[0].split('@')[0]
        form.import2 = fieldValue.split(',')[0].split('@')[1]
        form.import3 = fieldValue.split(',')[1]
      }
    } else if (startsWith(fieldValue, '{')) {
      Object.assign(form, JSON.parse(fieldValue))
    } else {
      form.callmethodType = '导出'
      form.customType = '否'
      form.fileName = fieldValue.split(',')[0]
      form.handleClassPrefix = fieldValue.split(',')[1]
      
      const parts = fieldValue.split(',')
      let exportType = ''
      
      if (parts.length === 3) {
        if (parts[2] === 'ALL') {
          exportType = '一次性批量导出'
        } else if (parts[2] === 'CUSTOM') {
          exportType = '自定义格式导出'
        } else {
          exportType = ''
        }
      } else {
        exportType = '流式导出'
      }
      
      form.exportType = exportType
    }
  }

  title.value = '导入/导出配置'
  visible.value = true
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const handleOk = async () => {
  if (!formRef.value) {
    Message.error('表单初始化失败')
    return
  }

  try {
    const result = await formRef.value.validate()
    if (result) return false

    loading.value = true
    let json = ''

    if (form.callmethodType === '导入') {
      json = `${form.import1}@${form.import2},${form.import3}`
    } else {
      const exportData = {
        callmethodType: form.callmethodType,
        fileName: form.fileName,
        handleClassPrefix: form.handleClassPrefix,
        exportType: form.exportType,
        bCustomTableHead: form.bCustomTableHead,
        customTableHeadFunc: form.customTableHeadFunc,
        showSheetRowNum: form.showSheetRowNum,
        showMaxExportNumber: form.showMaxExportNumber
      }
      json = JSON.stringify(exportData)
    }

    emit('fieldCallmethodEdit', {
      rowIndex: fData.rowIndex!,
      json: json,
      field: fData.field
    })

    visible.value = false
  } catch (error: any) {
    if (error?.errors) {
      Message.error('必填项未填写完整')
    } else {
      Message.error('表单校验失败')
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  visible.value = false
}

watch([() => form.callmethodType, () => form.bCustomTableHead], () => {
  nextTick(() => {
    formRef.value?.clearValidate()
  })
})

defineExpose({
  openInit
})
</script>