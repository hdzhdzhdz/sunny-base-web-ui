<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { Modal } from '@sunny-base-web/ui'
import { requestClient } from '../../../api/request'
import { useForm } from '../../../hooks/useForm'
import { getOtherPermissionsConfig } from './config'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { addFormSchema } = getOtherPermissionsConfig({ t })
import type { OtherPermissionsFormVO } from './types'

defineOptions({
  name: 'OtherPermissionsAdd'
})

interface Props {
  visible: boolean
  parentId?: string
  parentName?: string
  cExresnum?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  parentId: '0',
  parentName: '',
  cExresnum: '',
  id: ''
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const loading = ref(false)

// 表单配置
const [Form, formApi] = useForm({ schema: addFormSchema })

// 监听弹窗打开，重置表单并设置父级权限
watch(() => props.visible, (val) => {
  if (val) {
    formApi.resetForm()
    // 设置表单值
    if (props.cExresnum) {
      formApi.setValues({
        cExresparnum: props.cExresnum,
        id: props.id
      })
    }
  }
})

// 弹窗标题
const modalTitle = computed(() => {
  return props.parentId && props.parentId !== '0'
    ? `${t('otherPermissions.addTitle')} - ${props.parentName}`
    : t('otherPermissions.addTitle')
})

// 提交表单
async function handleSubmit() {
  try {
    const { valid } = await formApi.validate()
    if (!valid) return false

    const values = await formApi.getValues() as OtherPermissionsFormVO

    const params = {
      authExres: {
        ...values,
        cExresparnum: props.cExresnum || '',
        id: props.id || '',
      }
    }

    const res = await requestClient.post<{ message?: string }>('/core/authExres/add', params)
    Message.success(res.message || t('otherPermissions.addSuccess'))
    emit('success')
    return true
  } catch (error: any) {
    console.error('新增失败:', error)
    return false
  }
}

// 取消
function handleClose() {
  emit('update:visible', false)
}
</script>

<template>
  <Modal :model-value="props.visible" :title="modalTitle" :width="700" :on-before-ok="handleSubmit"
    @update:model-value="emit('update:visible', $event)" @close="handleClose">
    <Form />
  </Modal>
</template>