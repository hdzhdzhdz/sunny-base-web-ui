<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Modal, Form, Input, Button, Message } from '@arco-design/web-vue'
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

// 表单引用
const formRef = ref<InstanceType<typeof Form> | null>(null)

// 表单数据
const onceForm = reactive({
  id: '',
  jobDesc: '',
  executorParam: ''
})

// 加载状态
const loading = ref(false)

// 监听表单数据变化
watch(() => props.formData, (newData) => {
  if (newData) {
    Object.assign(onceForm, {
      id: newData.id,
      jobDesc: newData.jobDesc,
      executorParam: ''
    })
  }
}, { deep: true })

// 执行一次
const executeOnce = async () => {
  if (!formRef.value) return
  
  formRef.value.validate().then(async () => {
    loading.value = true
    
    try {
      const response = await requestClient.post('/schedule/jobinfo/trigger', {
        id: onceForm.id,
        executorParam: onceForm.executorParam
      })
      
      if (response.success) {
        Message.success('执行成功')
        emit('success')
        quit()
      }
    } catch (error) {
      console.error('执行失败:', error)
      Message.error('执行失败')
    } finally {
      loading.value = false
    }
  })
}

// 关闭弹窗
const quit = () => {
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  // 重置表单
  Object.assign(onceForm, {
    id: '',
    jobDesc: '',
    executorParam: ''
  })
  emit('update:visible', false)
}

// 暴露方法给父组件
defineExpose({
  show: (data?: any) => {
    if (data) {
      Object.assign(onceForm, {
        id: data.id,
        jobDesc: data.jobDesc,
        executorParam: ''
      })
    } else {
      // 重置表单
      Object.assign(onceForm, {
        id: '',
        jobDesc: '',
        executorParam: ''
      })
    }
    emit('update:visible', true)
  }
})
</script>

<template>
  <a-modal
    title="执行一次"
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    :mask-closable="false"
    :closable="false"
    width="500px"
    :footer="false"
  >
    <a-form
      ref="formRef"
      :model="onceForm"
      :label-width="100"
    >
      <a-form-item label="任务描述">
        <a-input v-model="onceForm.jobDesc" disabled />
      </a-form-item>

      <a-form-item label="执行参数">
        <a-textarea
          v-model="onceForm.executorParam"
          :rows="4"
          placeholder="请输入执行参数（可选）"
        />
      </a-form-item>
    </a-form>
    
    <div class="flex justify-end gap-2 mt-4">
      <a-button type="primary" :loading="loading" @click="executeOnce">执行</a-button>
      <a-button @click="quit">取消</a-button>
    </div>
  </a-modal>
</template>
