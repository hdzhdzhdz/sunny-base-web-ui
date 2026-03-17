<script setup lang="ts">
import { ref } from 'vue'
import { Modal, Upload, Button, Switch, Message } from '@arco-design/web-vue'
import axios from 'axios'
import { DEFAULT_FORM_COMMON_CONFIG } from '../../entry/form/config'

interface Props {
  title?: string
  width?: string | number
  templateUrl?: string
  uploadUrl?: string
  accept?: string
  maxSize?: number
  limit?: number
  params?: Record<string, any>
  nModid?: number | string
  nButtonid?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  title: '模板导入',
  width: '500px',
  accept: '.xlsx,.xls',
  maxSize: 10,
  limit: 1,
  templateUrl: '',
  uploadUrl: ''
})

const emit = defineEmits<{
  'upload-success': [response: any]
  'upload-error': [error: any]
  'download-success': []
  'download-error': [error: any]
  close: []
}>()

const visible = ref(false)
const fileList = ref<any[]>([])
const uploading = ref(false)
const decode = ref(false)
const uploadRef = ref();

const beforeUpload = (file: File) => {
  if (fileList.value.length >= props.limit) {
    Message.error(`最多只能上传 ${props.limit} 个文件`)
    return false
  }
  const isValidType = props.accept.split(',').some(type => file.name.endsWith(type.replace('.', '')))
  if (!isValidType) {
    Message.error(`只支持 ${props.accept} 格式的文件`)
    return false
  }
  const isValidSize = file.size / 1024 / 1024 < props.maxSize
  if (!isValidSize) {
    Message.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }
  return true
}

const handleUpload = () => {
  uploadRef.value.submit();
}

const customRequest = async(option: any) => {
  const { onProgress, onError, onSuccess, fileItem, name } = option
  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('fileName', fileItem.file)
    formData.append('nModid', String(props.nModid))
    formData.append('nButtonid', String(props.nButtonid))
    if (props.params) {
      formData.append('paramMap', JSON.stringify(props.params))
    }

    const uploadApiUrl = decode.value 
      ? `${DEFAULT_FORM_COMMON_CONFIG.apiPrefix}${props.uploadUrl}/upload/fileUploadDecode`
      : `${DEFAULT_FORM_COMMON_CONFIG.apiPrefix}${props.uploadUrl}/upload/fileUpload`

    const response = await axios.post(uploadApiUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response.data.code === 200) {
      Message.success({
        content: response.data.message || '上传成功',
        duration: 5000
      })
      onSuccess(response.data)
      emit('upload-success', response.data)
      close()
    } else {
      Message.error(response.data.message || '上传失败')
      onError(response.data)
      emit('upload-error', response.data)
    }
  } catch (error: any) {
    Message.error(error.message || '上传失败')
    onError(error)
    emit('upload-error', error)
  } finally {
    uploading.value = false
  }
};

const onChange = (fileList: any) => {
  fileList.value = fileList
};

const handleDownloadTemplate = async () => {
  try {
    const response = await axios.post(`${DEFAULT_FORM_COMMON_CONFIG.apiPrefix}${props.templateUrl}/export/fileDownload?nModid=${props.nModid}&nButtonid=${props.nButtonid}`, {}, {
      responseType: 'blob'
    })

    const fileReader = new FileReader()
    fileReader.onload = function() {
      const fileName = response.headers['content-disposition']?.split('attachment;filename=')[1]
      const blob = new Blob([response.data])
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = decodeURI(fileName || 'template.xlsx')
      link.click()
      URL.revokeObjectURL(link.href)
      emit('download-success')
    }
    fileReader.readAsText(response.data)
  } catch (error: any) {
    Message.error(error.message || '模板下载失败')
    emit('download-error', error)
  }
}

const open = () => {
  visible.value = true
  fileList.value = []
  decode.value = false
}

const close = () => {
  fileList.value = []
  visible.value = false
  emit('close')
}

defineExpose({
  open,
  close
})

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
    :footer="false"
    @cancel="handleCancel"
  >
    <div class="import-modal-body">
      <Upload
        action="#"
        :auto-upload="false"
        ref="uploadRef"
        multiple
        :custom-request="customRequest"
        @before-upload="beforeUpload"
        @change="onChange"
      >
        <template #upload-button>
          <a-space>
            <Button
              type="outline"
              :disabled="uploading"
              @click.stop="handleDownloadTemplate"
            >
              模板下载
            </Button>
            <Button>选择文件</Button>
            <Button type="primary" :disabled="uploading" @click.stop="handleUpload">开始上传</Button>
            <div @click.stop>
              <span class="option-label">是否加密：</span>
              <Switch v-model="decode" @click.stop />
            </div>
          </a-space>
        </template>
      </Upload>
    </div>
  </Modal>
</template>

<style scoped>
</style>
