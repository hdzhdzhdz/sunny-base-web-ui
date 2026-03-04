<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useSunnyForm, Modal } from '@sunny-base-web/ui'
import { requestClient } from '@sunny-base-web/effects'
import { addFormSchema } from './config'
import type { DataDictionaryFormVO } from './types'

defineOptions({
  name: 'DataDictionaryAdd'
})

interface Props {
  visible: boolean
  parentId?: string
  parentName?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  parentId: '0',
  parentName: ''
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const loading = ref(false)

// 表单配置
const [Form, formApi] = useSunnyForm({
  layout: 'horizontal',
  size: 'small',
  labelWidth: 100,
  showDefaultActions: false,
  schema: addFormSchema
})

// 监听弹窗打开，重置表单并设置父级字典
watch(() => props.visible, (val) => {
  if (val) {
    formApi.resetForm()
    // 设置父级字典显示名称
    formApi.setValues({
      parentName: props.parentName || '无'
    })
  }
})

// 弹窗标题
const modalTitle = computed(() => {
  return props.parentId && props.parentId !== '0'
    ? `新增子级字典 - ${props.parentName}`
    : '新增根级字典'
})

// 提交表单
async function handleSubmit() {
  try {
    const valid = await formApi.validate()
    if (!valid) return

    loading.value = true
    const values = await formApi.getValues() as DataDictionaryFormVO

    const params = {
      authDict: {
        cXuhao: values.cXuhao,
        cName: values.cName,
        cSign: values.cSign,
        nParent: props.parentId || '0',
        nOrder: values.nOrder || 0,
        cMeta: '{}'
      }
    }

    const res = await requestClient.post<{ message?: string }>('/core/authDict/add', params)
    Message.success(res.message)
    emit('update:visible', false)
    emit('success')
  } catch (error: any) {
    console.error('新增失败:', error)
    // 错误消息由拦截器统一处理，这里不再重复提示
  } finally {
    loading.value = false
  }
}

// 取消
function handleClose() {
  emit('update:visible', false)
}
</script>

<template>
  <Modal
    :model-value="props.visible"
    :title="modalTitle"
    :width="600"
    :loading="loading"
    @update:model-value="emit('update:visible', $event)"
    @ok="handleSubmit"
    @close="handleClose"
  >
    <Form />
  </Modal>
</template>
