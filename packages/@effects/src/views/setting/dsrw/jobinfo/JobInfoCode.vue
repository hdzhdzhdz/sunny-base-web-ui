<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Modal, Input, Button, Select, Message } from '@arco-design/web-vue'
import { requestClient } from '@sunny-base-web/effects'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Props
const props = defineProps<{
  visible: boolean
  formData?: any
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

// 表单数据
const codeForm = reactive({
  id: '',
  jobDesc: '',
  glueSource: '',
  glueRemark: '',
  version: ''
})

// 版本列表
const versionOptions = ref<any[]>([])

// 加载状态
const loading = ref(false)
const saving = ref(false)

// 监听表单数据变化
watch(() => props.formData, (newData) => {
  if (newData) {
    Object.assign(codeForm, {
      id: newData.id,
      jobDesc: newData.jobDesc,
      glueSource: newData.glueSource || '',
      glueRemark: newData.glueRemark || '',
      version: ''
    })
    // 获取版本列表
    getVersions()
  }
}, { deep: true })

// 获取版本列表
const getVersions = async () => {
  loading.value = true
  try {
    const response = await requestClient.post('/schedule/jobcode/get', { id: codeForm.id })
    if (response.success && response.data) {
      versionOptions.value = response.data.map((item: any) => ({
        label: `版本 ${item.version}`,
        value: item.version,
        content: item.glueSource,
        remark: item.glueRemark
      }))
      // 默认选中最新版本
      if (versionOptions.value.length > 0) {
        codeForm.version = versionOptions.value[0].value
        codeForm.glueSource = versionOptions.value[0].content
        codeForm.glueRemark = versionOptions.value[0].remark
      }
    }
  } catch (error) {
    console.error('获取版本列表失败:', error)
    Message.error(t('jobinfo.getVersionsFailed'))
  } finally {
    loading.value = false
  }
}

// 版本切换
const handleVersionChange = (version: string) => {
  const selected = versionOptions.value.find(opt => opt.value === version)
  if (selected) {
    codeForm.glueSource = selected.content
    codeForm.glueRemark = selected.remark
  }
}

// 保存代码
const saveCode = async () => {
  saving.value = true
  try {
    const response = await requestClient.post('/schedule/jobcode/save', {
      id: codeForm.id,
      glueSource: codeForm.glueSource,
      glueRemark: codeForm.glueRemark
    })
    if (response.success) {
        Message.success(t('jobinfo.saveSuccess'))
        emit('success')
        getVersions() // 重新获取版本列表
      }
    } catch (error) {
      console.error('保存失败:', error)
      Message.error(t('jobinfo.saveFailed'))
  } finally {
    saving.value = false
  }
}

// 关闭弹窗
const quit = () => {
  // 重置表单
  Object.assign(codeForm, {
    id: '',
    jobDesc: '',
    glueSource: '',
    glueRemark: '',
    version: ''
  })
  versionOptions.value = []
  emit('update:visible', false)
}

// 暴露方法给父组件
defineExpose({
  show: (data?: any) => {
    if (data) {
      Object.assign(codeForm, {
        id: data.id,
        jobDesc: data.jobDesc,
        glueSource: data.glueSource || '',
        glueRemark: data.glueRemark || '',
        version: ''
      })
      // 获取版本列表
      getVersions()
    } else {
      // 重置表单
      Object.assign(codeForm, {
        id: '',
        jobDesc: '',
        glueSource: '',
        glueRemark: '',
        version: ''
      })
      versionOptions.value = []
    }
    emit('update:visible', true)
  }
})
</script>

<template>
  <a-modal
    :title="t('jobinfo.glueIde')"
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    :mask-closable="false"
    :closable="false"
    width="900px"
    :footer="false"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-4">
        <span class="text-gray-500">{{ t('jobinfo.jobDesc') }}:</span>
        <span class="flex-1">{{ codeForm.jobDesc }}</span>
        <a-select
          v-model="codeForm.version"
          :placeholder="t('jobinfo.selectVersion')"
          :loading="loading"
          @change="handleVersionChange"
        >
          <a-option
            v-for="option in versionOptions"
            :key="option.value"
            :value="option.value"
          >{{ option.label }}</a-option>
        </a-select>
      </div>

      <div>
        <label class="block text-gray-500 mb-2">{{ t('jobinfo.codeContent') }}:</label>
        <a-textarea
          v-model="codeForm.glueSource"
          :rows="20"
          :placeholder="t('jobinfo.inputCodeContent')"
        />
      </div>

      <div>
        <label class="block text-gray-500 mb-2">{{ t('jobinfo.remark') }}:</label>
        <a-textarea
          v-model="codeForm.glueRemark"
          :rows="4"
          :placeholder="t('jobinfo.inputRemark')"
        />
      </div>
    </div>
    
    <div class="flex justify-end gap-2 mt-4">
      <a-button type="primary" :loading="saving" @click="saveCode">{{ t('jobinfo.save') }}</a-button>
      <a-button @click="quit">{{ t('jobinfo.cancel') }}</a-button>
    </div>
  </a-modal>
</template>
