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
  name: 'OtherPermissionsUpdate'
})

interface Props {
  visible: boolean
  row?: any
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  row: null
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const loading = ref(false)

// 表单配置
const [Form, formApi] = useForm({ schema: addFormSchema })

// 监听弹窗打开，重置表单并设置表单值
watch(() => props.visible, (val) => {
  if (val && props.row) {
    formApi.resetForm()
    // 设置表单值，传递整个row对象的属性
    formApi.setValues({ ...props.row })
    // 禁用权限编号字段
    formApi.updateSchema([{
      fieldName: 'cExresnum',
      componentProps: { disabled: true }
    }])
  }
})

// 弹窗标题
const modalTitle = computed(() => {
  return t('otherPermissions.updateTitle')
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
        id: props.row.id,
        cExresparnum: props.row.cExresparnum || ''
      }
    }

    const res = await requestClient.post<{ message?: string }>('/core/authExres/edit', params)
    Message.success(res.message || t('otherPermissions.updateSuccess'))
    emit('success')
    return true
  } catch (error: any) {
    console.error('修改失败:', error)
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