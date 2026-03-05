<template>
  <div class="flex gap-2 items-center flex-nowrap overflow-hidden">
    <a-upload
      :show-file-list="false"
      :action="action"
      :custom-request="customRequest"
    >
      <template #upload-button>
        <a-button type="primary" size="mini">{{ $t('common.upload') }}</a-button>
      </template>
    </a-upload>
    <div class="flex gap-2 item-center flex-nowrap">
      <a-tag
        v-for="fileItem in fileList"
        :loading="false"
        :color="fileItem.status === 'error' ? 'red' : 'green'"
        closable
        @close="delFile(fileItem)"
      >{{ fileItem.name }}</a-tag>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import axios from 'axios';
import { Message } from '@arco-design/web-vue';
import type { FileItem } from '@arco-design/web-vue';

const props = defineProps({
  modelValue: {
    type: String
  },
  action: {
    type: String,
    required: true
  },
  delAction: {
    type: String,
    required: true
  },
  accept: {
    type: String,
  },
  encryptFile: {
    type: Boolean,
    default: false
  },
  storeType: {
    type: String,
    default: 'amazon'
  },
  s3FileDir: {
    type: String,
    default: ''
  },
  preSigned: {
    type: Boolean,
    default: false
  },
  preSignedExpire: {
    type: Number,
    default: 7
  },
  limit: {
    type: Number,
    default: undefined
  },
  maxSize: {
    type: Number,
    default: undefined
  },
})
 
const fileList = computed(() => {
  return JSON.parse(props.modelValue || '[]')
})

const emit = defineEmits(['update:modelValue', 'change'])

/**
 * 自定义上传请求
 * @param option 
 * @returns 
 */
const customRequest = (option: any) => {
  const {onProgress, onError, onSuccess, fileItem, name} = option

  if (props.limit && fileList.value.length >= props.limit) {
    Message.error(`最多只能上传 ${props.limit} 个文件`)
    onError()
    return
  }

  if (props.maxSize && fileItem.file.size > props.maxSize * 1024 * 1024) {
    Message.error(`文件大小不能超过 ${props.maxSize} MB`)
    onError()
    return
  }

  var formData = new FormData()
  formData.append('fileName', fileItem.file)
  formData.append('encryptFile', props.encryptFile === true ? '1' : '0') // 是否加密文件,1:是，0否，默认0
  formData.append('storeType', props.storeType) // 存储方式 amazon,vestacks3，默认amazon
  if (props.s3FileDir) {
    formData.append('s3FileDir', props.s3FileDir) // 文件上传S3目录,如果有指定的话，以这个为主
  }
  if (props.preSigned) {
    formData.append('preSigned', props.preSigned === true ? '1' : '0') // 是否需要生成签名URL，1：是
  }
  if (props.preSignedExpire) {
    formData.append('preSignedExpire', String(props.preSignedExpire)) // 签名URL过期时间(天),默认7天
  }
  axios.post(
    props.action,
    formData,
    {
      onUploadProgress: (progress: any) => {
        const num = Math.floor(progress.loaded / progress.total * 100)
        onProgress(num)
      }
    }
  ).then(res => {
    if(res.data.code === 200) {
      Message.success(res.data.message || '上传成功')
      onSuccess(res.data.result)
      const updatedList = [...fileList.value, fileItem]
      emit('update:modelValue', JSON.stringify(updatedList))
      emit('change', JSON.stringify(updatedList))
    } else {
      Message.error(res.data.message || '上传失败')
      onError()
    }
  }).catch(() => {
    onError()
  });
};

/**
 * 删除文件
 * @param fileItem 
 */
const delFile = (fileItem: FileItem) => {
  axios.post(
    props.delAction,
    {
      filePathList: [fileItem.response.url],
      storeType: props.storeType
    }
  ).then(res => {
    const { data } = res
    Message.success(data.message || '删除成功')
    
    if (data.code === 200) {
      const updatedList = fileList.value.filter((item: FileItem) => item.uid !== fileItem.uid)
      emit('update:modelValue', JSON.stringify(updatedList))
    }
  }).catch(err => {
    Message.error('删除失败')
    console.error('删除文件失败:', err)
  })
}
</script>
