<script setup lang="ts">
/**
 * @file 上传组件
 * @description 支持 S3 上传、文件预览和管理的上传组件。
 * @author Sunny
 */

import { ref, computed, watch } from 'vue';
import {
  Message,
  Modal,
  Upload as AUpload,
  Checkbox as ACheckbox,
  Progress as AProgress
} from '@arco-design/web-vue';
// import { Paperclip, CloudUpload, Trash2 } from '@sunny-base-web/icons';
import { IconAttachment, IconUpload, IconDelete } from '@arco-design/web-vue/es/icon';
import { SunnyIcon } from '../../basic/icon';
import axios from 'axios';
import { DEFAULT_FORM_COMMON_CONFIG } from '../../entry/form/config';  // ✅ 导入全局配置

// --- 常量 ---

const BYTES_PER_KB = 1024;
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

// --- 类型 ---

export interface UploadProps {
  /** 初始文件列表 JSON 字符串 */
  modelValue?: string;
  /** 上传接口地址 */
  action?: string;
  /** 删除接口地址 */
  delAction?: string;
  /** 接受的文件类型 */
  accept?: string;
  /** 最大文件数量 */
  limit?: number;
  /** 最大文件大小 (MB) */
  maxSize?: number;
  /** 存储类型 (例如 'amazon') */
  storeType?: string;
  /** S3 目录路径 */
  s3FileDir?: string;
  /** 预签名 URL 标识 */
  preSigned?: string;
  /** 预签名 URL 过期时间 */
  preSignedExpire?: string;
  /** 只读模式 */
  readonly?: boolean;
  /** 显示加密选项 */
  showEncrypt?: boolean;
  /** 是否加密文件 */
  encryptFile?: boolean;
}

interface FileItem {
  uid: string;
  name: string;
  size: number;
  type: string;
  file?: File;
  percentage: number;
  checked?: boolean;
  url?: string;
  status?: string;
  [key: string]: any;
}

// --- 属性与事件 ---

const props = withDefaults(defineProps<UploadProps>(), {
  modelValue: '',
  action: undefined,  // ✅ 改为 undefined，支持全局配置
  delAction: undefined,  // ✅ 改为 undefined，支持全局配置
  accept: undefined,  // ✅ 改为 undefined，支持全局配置
  limit: undefined,  // ✅ 改为 undefined，支持全局配置
  maxSize: undefined,  // ✅ 改为 undefined，支持全局配置
  storeType: undefined,  // ✅ 改为 undefined，支持全局配置
  s3FileDir: undefined,  // ✅ 改为 undefined，支持全局配置
  preSigned: undefined,  // ✅ 改为 undefined，支持全局配置
  preSignedExpire: undefined,  // ✅ 改为 undefined，支持全局配置
  readonly: false,
  showEncrypt: false,
  encryptFile: undefined,  // ✅ 新增：支持全局配置
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

// --- 状态 ---

const collapsed = ref(true);
const encryptFile = ref(false);
const fileList = ref<FileItem[]>([]);
const dLoading = ref(false);

// --- 计算属性 ---

/**
 * 合并全局配置和组件 Props
 * 优先级：组件 Props > 全局配置 > 默认值
 */
const mergedConfig = computed(() => {
  const globalConfig = DEFAULT_FORM_COMMON_CONFIG.uploadConfig || {};

  return {
    // 合并 action（优先级：props > 全局配置）
    action: props.action || globalConfig.action || '',

    // 合并 delAction（优先级：props > 全局配置）
    delAction: props.delAction || globalConfig.delAction || '',

    // 合并其他配置（优先级：props > 全局配置 > 默认值）
    accept: props.accept ?? globalConfig.accept ?? '.csv,.pdf,.xls,.xlsx',
    limit: props.limit ?? globalConfig.limit ?? 10,
    maxSize: props.maxSize ?? globalConfig.maxSize ?? 10,
    storeType: props.storeType ?? globalConfig.storeType ?? 'amazon',
    s3FileDir: props.s3FileDir ?? globalConfig.s3FileDir ?? '',
    preSigned: props.preSigned ?? globalConfig.preSigned ?? '',
    preSignedExpire: props.preSignedExpire ?? globalConfig.preSignedExpire ?? '',
    encryptFile: props.encryptFile ?? globalConfig.encryptFile ?? false,
  };
});

// 验证必要配置
if (!mergedConfig.value.action) {
  console.warn(
    '[SunnyUpload] Missing required config: action. ' +
    'Please provide via props or configure globally using setupBusinessForm().'
  );
}

if (!mergedConfig.value.delAction) {
  console.warn(
    '[SunnyUpload] Missing required config: delAction. ' +
    'Please provide via props or configure globally using setupBusinessForm().'
  );
}

/**
 * 检查是否应禁用 S3 上传。
 * 如果所有文件都已上传（拥有 URL），则禁用。
 */
const s3Disabled = computed(() => {
  return fileList.value.every(el => !!el.url);
});

/**
 * 当前选中的文件数量。
 */
const checkLength = computed(() => fileList.value.filter(item => item.checked).length);

// --- 监听器 ---

watch(() => props.modelValue, (v) => {
  try {
    fileList.value = JSON.parse(v || '[]');
  } catch (e) {
    console.warn('Failed to parse modelValue:', e);
    fileList.value = [];
  }
}, { immediate: true, deep: true });

// --- 工具函数 ---

/**
 * 模拟翻译函数。如果需要，请替换为实际的 i18n 逻辑。
 */
const t = (s: string) => s;

/**
 * 将字节格式化为人类可读的字符串。
 */
const bytesToSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(BYTES_PER_KB));
  return (bytes / Math.pow(BYTES_PER_KB, i)).toPrecision(3) + ' ' + SIZE_UNITS[i];
};

/**
 * 根据文件扩展名或类型确定图标。
 */
const renderFileTypeIcon = (item: FileItem): string => {
  const type = item.type || '';
  const name = item.name || '';
  const ext = name.split('.').pop()?.toLowerCase() || '';
  
  const iconMap: Record<string, string[]> = {
    'vscode-icons:file-type-excel': ['xls', 'xlsx', 'csv'],
    'vscode-icons:file-type-powerpoint': ['ppt', 'pptx'],
    'vscode-icons:file-type-text': ['txt'],
    'vscode-icons:file-type-word': ['doc', 'docx'],
    'vscode-icons:file-type-zip': ['zip', 'rar', '7z', 'tar', 'gz'],
    'vscode-icons:file-type-pdf': ['pdf'],
  };

  for (const [icon, exts] of Object.entries(iconMap)) {
    if (exts.includes(ext) || exts.some(e => type.includes(e))) {
      return icon;
    }
  }

  // 如果扩展名匹配失败，则进行 mime 类型检查作为后备
  if (type.includes('excel') || type.includes('spreadsheet')) return 'vscode-icons:file-type-excel';
  if (type.includes('powerpoint') || type.includes('presentation')) return 'vscode-icons:file-type-powerpoint';
  if (type.includes('text/plain')) return 'vscode-icons:file-type-text';
  if (type.includes('word') || type.includes('document')) return 'vscode-icons:file-type-word';
  if (type.includes('zip') || type.includes('compressed')) return 'vscode-icons:file-type-zip';
  if (type.includes('pdf')) return 'vscode-icons:file-type-pdf';

  return 'vscode-icons:default-file';
};

/**
 * 更新 modelValue 并触发 change 事件。
 */
const updateFileList = () => {
  const jsonStr = JSON.stringify(fileList.value);
  emit('update:modelValue', jsonStr);
  emit('change', jsonStr);
};

// --- 事件处理 ---

/**
 * 处理上传组件的新文件选择。
 */
const handleFileChange = (_: any, currentFile: any) => {
  if (currentFile.status !== 'init') return;

  const config = mergedConfig.value;  // ✅ 使用合并后的配置

  if (fileList.value.length >= config.limit) {
    Message.error(`最多上传${config.limit}个文件`);
    return;
  }

  const maxSizeInBytes = config.maxSize * 1024 * 1024;
  if (currentFile.file.size > maxSizeInBytes) {
    Message.error(`文件最大限制${bytesToSize(maxSizeInBytes)}`);
    return;
  }

  fileList.value.push({
    uid: currentFile.uid,
    name: currentFile.name,
    size: currentFile.file?.size,
    type: currentFile.file?.type,
    file: currentFile.file,
    percentage: 0,
    checked: false
  });
};

/**
 * 上传待处理文件到 S3/服务器。
 */
const uploadToS3 = async () => {
  if (fileList.value.length === 0) return;
  
  const config = mergedConfig.value;
  const filesToUpload = fileList.value.filter(fl => !fl.url);
  
  for (const fl of filesToUpload) {
    const formData = new FormData();
    formData.append('fileName', fl.file as Blob);
    formData.append('encryptFile', encryptFile.value ? '1' : '0');
    if (config.storeType) formData.append('storeType', config.storeType);
    if (config.s3FileDir) formData.append('s3FileDir', config.s3FileDir);
    if (config.preSigned) formData.append('preSigned', config.preSigned);
    if (config.preSignedExpire) formData.append('preSignedExpire', config.preSignedExpire);

    try {
      const res = await axios.post(config.action, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
             const num = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
             fl.percentage = num;
          }
        }
      });
      
      const { data } = res;
      if (data.code === 200) {
        Object.assign(fl, data.result);
        Message.success(data.message || '上传成功');
      } else {
         Message.error(data.message || '上传失败');
         removeFileByUid(fl.uid);
      }
    } catch (error) {
       Message.error('上传失败');
       removeFileByUid(fl.uid);
    }
  }
  updateFileList();
};

const removeFileByUid = (uid: string) => {
  const idx = fileList.value.findIndex(item => item.uid === uid);
  if (idx > -1) fileList.value.splice(idx, 1);
};

/**
 * 删除单个文件。
 */
const handleRemove = (item: FileItem, index: number) => {
  const config = mergedConfig.value;

  if (item.url) {
    Modal.confirm({
      title: t('提示'),
      content: t('是否删除该文件?'),
      onOk: () => {
         axios.post(config.delAction, {
           filePathList: [item.url],
           storeType: config.storeType
         }).then(res => {
           const { data } = res;
           Message[data.success ? 'success' : 'error'](data.message);
           if (data.code === 200) {
             fileList.value.splice(index, 1);
             updateFileList();
           }
         });
      }
    });
  } else {
    fileList.value.splice(index, 1);
    updateFileList();
  }
};

/**
 * 切换全选/取消全选所有文件。
 */
const checkAll = () => {
  const allChecked = fileList.value.every(f => f.checked);
  fileList.value.forEach(f => f.checked = !allChecked);
};

/**
 * 删除所有选中的文件。
 */
const checkDel = () => {
  const config = mergedConfig.value;
  const checkedFiles = fileList.value.filter(f => f.checked);
  if (checkedFiles.length === 0) return;

  Modal.confirm({
    title: t('提示'),
    content: t('是否删除选中的文件?'),
    onOk: () => {
      dLoading.value = true;
      const urls = checkedFiles.map(f => f.url).filter(Boolean) as string[];
      
      if (urls.length > 0) {
          axios.post(config.delAction, {
            filePathList: urls,
            storeType: config.storeType
          }).then(res => {
             const { data } = res;
             Message[data.success ? 'success' : 'error'](data.message);
             if (data.code === 200) {
               fileList.value = fileList.value.filter(f => !f.checked);
               updateFileList();
             }
          }).finally(() => {
             dLoading.value = false;
          });
      } else {
        // 仅删除尚未上传的本地文件
        fileList.value = fileList.value.filter(f => !f.checked);
        updateFileList();
        dLoading.value = false;
      }
    }
  });
};
</script>

<template>
  <div class="sunny-file-upload">
    <!-- Title -->
    <div class="font-bold text-gray-700 mb-2">{{ t('附件') }}</div>

    <!-- Toolbar -->
    <div v-show="!readonly" class="flex flex-wrap items-center text-sm mb-3 select-none">
      <!-- File Selection -->
      <a-upload
        :show-file-list="false"
        :auto-upload="false"
        multiple
        :accept="mergedConfig.accept"
        @change="handleFileChange"
      >
        <template #upload-button>
          <span class="cursor-pointer text-blue-600  hover:text-blue-700 flex items-center mr-4 transition-colors">
            <IconAttachment class="mr-1 w-4 h-4" /> {{ t('选择附件') }}
          </span>
        </template>
      </a-upload>

      <!-- Upload Trigger -->
      <span 
        class="flex items-center mr-4 transition-colors"
        :class="s3Disabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer text-gray-600 hover:text-gray-800'"
        @click="!s3Disabled && uploadToS3()"
      >
        <IconUpload class="mr-1 w-4 h-4" />
        {{ t('上传附件') }}
      </span>

      <!-- Batch Actions -->
      <span class="cursor-pointer text-blue-600 hover:text-blue-700 mr-4 transition-colors" @click="checkAll">
        {{ t('全选') }}
      </span>
      
      <span 
        class="mr-4 transition-colors"
        :class="checkLength === 0 ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer text-gray-500 hover:text-red-500'"
        @click="checkDel"
      >
        {{ t('删除') }}
      </span>

      <!-- Encryption Toggle -->
      <a-checkbox v-if="showEncrypt" v-model="encryptFile" class="mr-4">
        <span class="text-xs text-blue-600">{{ t('是否加密') }}</span>
      </a-checkbox>

      <!-- Hint Text -->
      <span class="text-xs text-gray-400">
        （{{ t('单个文件最大') }}{{ mergedConfig.maxSize }}MB，{{ t('最多上传') }}{{ mergedConfig.limit }}{{ t('个') }}）
      </span>

      <!-- Collapse Toggle -->
      <span class="ml-auto cursor-pointer text-blue-600 text-xs hover:text-blue-700 transition-colors" @click="collapsed = !collapsed">
        {{ collapsed ? t('隐藏') : t('展开') }}
      </span>
    </div>

    <!-- File List -->
    <div v-show="fileList.length > 0 && collapsed" class="border border-dashed border-gray-300 rounded-lg p-4 transition-all duration-300">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          v-for="(item, index) in fileList" 
          :key="item.uid || index" 
          class="bg-gray-50 hover:bg-gray-100 rounded p-3 relative flex items-center border border-transparent hover:border-gray-200 transition-colors group"
        >
          <!-- Icon -->
          <SunnyIcon :icon="renderFileTypeIcon(item)" class="w-10 h-10 mr-3 flex-shrink-0" />
          
          <!-- Info -->
          <div class="flex-1 min-w-0 pr-8">
            <div class="text-sm truncate font-medium text-gray-700 mb-1" :title="item.name">{{ item.name }}</div>
            <div class="flex items-center text-xs text-gray-500">
              <span class="mr-3 min-w-[3em]">{{ bytesToSize(item.size) }}</span>
              <a-progress 
                :percent="item.percentage / 100" 
                size="small" 
                :show-text="false" 
                :color="item.percentage === 100 ? '#00b42a' : '#165dff'"
                class="flex-1" 
              />
              <span class="ml-2 w-8 text-right">{{ item.percentage }}%</span>
            </div>
          </div>

          <!-- Actions -->
          <a-checkbox v-if="!readonly" v-model="item.checked" class="absolute top-3 right-3" />
          
          <IconDelete 
            v-if="!readonly"
            class="absolute bottom-3 right-3 w-4 h-4 cursor-pointer text-gray-400 hover:text-red-500 transition-colors" 
            @click="handleRemove(item, index)" 
          />
        </div>
      </div>
    </div>
  </div>
</template>