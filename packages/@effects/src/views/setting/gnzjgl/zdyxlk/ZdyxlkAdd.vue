<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useSunnyForm, Modal } from '@sunny-base-web/ui'
import { requestClient } from '@sunny-base-web/effects'
import { useI18n } from 'vue-i18n'
import { getZdyxlkConfig } from './config'

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

const { addEditFormSchema } = getZdyxlkConfig({ t, formApi })

// 监听字段值变化
formApi.setState({
  handleValuesChange: (changedValues: any) => {
    if ('nCbtype' in changedValues) {
      const showFields = changedValues.nCbtype === '0'
      updateFieldsVisibility(changedValues.nCbtype)
    }
  }
})

// 控制字段显示隐藏的函数
const updateFieldsVisibility = (nCbtype: string) => {
  const showFields = nCbtype === '0'
  // 使用 updateSchema 方法更新字段的 hidden 属性
  formApi.updateSchema([
    {
      fieldName: 'cValcol',
      hidden: !showFields
    },
    {
      fieldName: 'cLabelcol',
      hidden: !showFields
    }
  ])
}

const addInit = async () => {
  visible.value = true
  type.value = 'add'
  formApi.setState({ schema: addEditFormSchema })
  formApi.resetForm()
  formApi.setValues({ nCbtype: '0' })
  
  await nextTick()
  updateFieldsVisibility('0')
}

const editInit = async (record: any) => {
  isEditingInit.value = true
  visible.value = true
  type.value = 'edit'
  formApi.setState({ schema: addEditFormSchema })
  formApi.resetForm()
  
  try {
    const response = await requestClient.post('/core/assSelect/update_init', { id: record.id })
    if (response.code === 200 && response.result) {
      const formValues = { ...response.result }
      // 将指定字段转换为字符串
      if (formValues.nCbtype !== undefined) formValues.nCbtype = String(formValues.nCbtype)
      if (formValues.nLikematch !== undefined) formValues.nLikematch = String(formValues.nLikematch)
      if (formValues.nSfcommon !== undefined) formValues.nSfcommon = String(formValues.nSfcommon)
      if (formValues.nType !== undefined) formValues.nType = String(formValues.nType)
      
      formApi.setValues(formValues, false)
      formApi.updateSchema([{
        fieldName: 'cNum',
        componentProps: { disabled: true }
      }])
      updateFieldsVisibility(formValues.nCbtype)
    }
  } catch (error) {
    console.error('查询失败:', error)
    Message.error(t('zdyxlk.queryFailed'))
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
  const params = { ...values }
  
  try {
    const response = await requestClient.post(
      type.value === 'add' ? '/core/assSelect/insert' : '/core/assSelect/update',
      params
    )
    
    if (response.code === 200) {
      Message.success(type.value === 'add' ? t('zdyxlk.addSuccess') : t('zdyxlk.editSuccess'))
      visible.value = false
      emit('success')
      return true
    } else {
      Message.error(response.message || t('zdyxlk.saveFailed'))
      return false
    }
  } catch (error) {
    console.error('保存失败:', error)
    Message.error(t('zdyxlk.saveFailed'))
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
    :title="type === 'add' ? t('zdyxlk.addTitle') : t('zdyxlk.editTitle')"
    :on-before-ok="handleSubmit"
    @close="handleClose"
    width="800px"
  >
    <Form />
  </Modal>
</template>