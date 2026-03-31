<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useSunnyForm, Modal } from '@sunny-base-web/ui'
import { requestClient } from '@sunny-base-web/effects'
import { useI18n } from 'vue-i18n'
import { getAssSendoaConfig } from './config'

const { t } = useI18n()

const visible = ref(false)
const type = ref<'add' | 'edit'>('add')
const isEditingInit = ref(false)
const emit = defineEmits<{
  success: []
}>()

const [Form, formApi] = useSunnyForm({
  layout: 'vertical',
  size: 'small',
  labelWidth: 120,
  showDefaultActions: false,
  scrollToFirstError: true,
  schema: []
})

const { addEditFormSchema } = getAssSendoaConfig({ t, formApi })

const addInit = async () => {
  visible.value = true
  type.value = 'add'
  formApi.setState({ schema: addEditFormSchema })
  formApi.resetForm()
  
  await nextTick()
}

const editInit = async (record: any) => {
  isEditingInit.value = true
  visible.value = true
  type.value = 'edit'
  formApi.setState({ schema: addEditFormSchema })
  formApi.resetForm()
  
  try {
    const response = await requestClient.post('/core/assSendoa/update_init', { assSendoa: { id: record.id } })
    if (response.code === 200 && response.result) {
      const formValues = { ...response.result }
      // 将nSign转换为字符串
      if (formValues.nSign !== undefined) {
        formValues.nSign = String(formValues.nSign)
      }
      
      formApi.setValues(formValues, false)
    }
  } catch (error) {
    console.error('查询失败:', error)
    Message.error(t('assSendoa.queryFailed'))
  }
  
  await nextTick()
  
  isEditingInit.value = false
}

defineExpose({
  addInit,
  editInit
})

// 提交表单
const handleSubmit = async () => {
  const { valid } = await formApi.validate()
  if (!valid) return false
  
  const values = await formApi.getValues()
  const params = { assSendoa: { ...values } }
  
  try {
    const response = await requestClient.post(
      type.value === 'add' ? '/core/assSendoa/insert' : '/core/assSendoa/update',
      params
    )
    
    if (response.code === 200) {
      Message.success(type.value === 'add' ? t('assSendoa.addSuccess') : t('assSendoa.editSuccess'))
      visible.value = false
      emit('success')
      return true
    } else {
      Message.error(response.message || t('assSendoa.saveFailed'))
      return false
    }
  } catch (error) {
    console.error('保存失败:', error)
    Message.error(t('assSendoa.saveFailed'))
    return false
  }
}

// 取消
const handleClose = () => {
  visible.value = false
}
</script>

<template>
  <Modal
    :model-value="visible"
    :title="type === 'add' ? t('assSendoa.addTitle') : t('assSendoa.editTitle')"
    :on-before-ok="handleSubmit"
    @close="handleClose"
    width="800px"
  >
    <Form />
  </Modal>
</template>