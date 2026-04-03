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
import { DEFAULT_FORM_COMMON_CONFIG } from '../../entry/form/config';  // ✅ 导入全局配置

const props = defineProps({
  modelValue: {
    type: String
  },
  action: {
    type: String,
    required: false,  // ✅ 改为 false，使用全局配置作为默认值
  },
  delAction: {
    type: String,
    required: false,  // ✅ 改为 false，使用全局配置作为默认值
  },
  accept: {
    type: String,
  },
  encryptFile: {
    type: Boolean,
    default: undefined  // ✅ 改为 undefined，支持全局配置
  },
  storeType: {
    type: String,
    default: undefined  // ✅ 改为 undefined，支持全局配置
  },
  s3FileDir: {
    type: String,
    default: undefined  // ✅ 改为 undefined，支持全局配置
  },
  preSigned: {
    type: Boolean,
    default: undefined  // ✅ 改为 undefined，支持全局配置
  },
  preSignedExpire: {
    type: Number,
    default: undefined  // ✅ 改为 undefined，支持全局配置
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

/**
 * 合并全局配置和组件 Props
 * Merge global config and component props
 * @description 优先级：组件 Props > 全局配置 > 默认值
 * @description Priority: Component Props > Global Config > Default Values
 */
const mergedConfig = computed(() => {
  const globalConfig = DEFAULT_FORM_COMMON_CONFIG.uploadConfig || {};

  return {
    // 合并 action（优先级：props > 全局配置）
    action: props.action || globalConfig.action,

    // 合并 delAction（优先级：props > 全局配置）
    delAction: props.delAction || globalConfig.delAction,

    // 合并其他配置（优先级：props > 全局配置 > 默认值）
    accept: props.accept ?? globalConfig.accept,
    encryptFile: props.encryptFile ?? globalConfig.encryptFile ?? false,
    storeType: props.storeType ?? globalConfig.storeType ?? 'amazon',
    s3FileDir: props.s3FileDir ?? globalConfig.s3FileDir ?? '',
    preSigned: props.preSigned ?? globalConfig.preSigned ?? false,
    preSignedExpire: props.preSignedExpire ?? globalConfig.preSignedExpire ?? 7,
    limit: props.limit ?? globalConfig.limit,
    maxSize: props.maxSize ?? globalConfig.maxSize,
  };
});

// 验证必要配置
if (!mergedConfig.value.action) {
  console.warn(
    '[SunnySimpleUpload] Missing required config: action. ' +
    'Please provide via props or configure globally using setupBusinessForm().'
  );
}

if (!mergedConfig.value.delAction) {
  console.warn(
    '[SunnySimpleUpload] Missing required config: delAction. ' +
    'Please provide via props or configure globally using setupBusinessForm().'
  );
}

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

  // ✅ 使用合并后的配置
  const config = mergedConfig.value;

  if (config.limit && fileList.value.length >= config.limit) {
    Message.error(`最多只能上传 ${config.limit} 个文件`)
    onError()
    return
  }

  if (config.maxSize && fileItem.file.size > config.maxSize * 1024 * 1024) {
    Message.error(`文件大小不能超过 ${config.maxSize} MB`)
    onError()
    return
  }

  var formData = new FormData()
  formData.append('fileName', fileItem.file)
  formData.append('encryptFile', config.encryptFile === true ? '1' : '0') // 是否加密文件,1:是，0否，默认0
  formData.append('storeType', config.storeType) // 存储方式 amazon,vestacks3，默认amazon
  if (config.s3FileDir) {
    formData.append('s3FileDir', config.s3FileDir) // 文件上传S3目录,如果有指定的话，以这个为主
  }
  if (config.preSigned) {
    formData.append('preSigned', config.preSigned === true ? '1' : '0') // 是否需要生成签名URL，1：是
  }
  if (config.preSignedExpire) {
    formData.append('preSignedExpire', String(config.preSignedExpire)) // 签名URL过期时间(天),默认7天
  }
  axios.post(
    config.action,  // ✅ 使用合并后的 action
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
  // ✅ 使用合并后的配置
  const config = mergedConfig.value;

  axios.post(
    config.delAction,  // ✅ 使用合并后的 delAction
    {
      filePathList: [fileItem.response.url],
      storeType: config.storeType  // ✅ 使用合并后的 storeType
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
