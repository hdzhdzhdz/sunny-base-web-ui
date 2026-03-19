<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useSunnyForm, Modal } from '@sunny-base-web/ui'
import { requestClient } from '../../../api/request'
import { getUserConfig } from './config'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const visible = ref(false)
const type = ref<'add' | 'edit'>('add')
const emit = defineEmits<{
  success: []
}>()

// 表单配置
const [Form, formApi] = useSunnyForm({
  layout: 'horizontal',
  size: 'small',
  labelWidth: 100,
  gridProps: {
    xGap: 0,
    yGap: 0,
  },
  showDefaultActions: false,
  scrollToFirstError: true,
  schema: [],
  objectToValueFields: ['cWork'],
})

const { addEditFormSchema } = getUserConfig({ t, formApi })

const addInit = () => {
  visible.value = true
  type.value = 'add'
  formApi.setState({ schema: addEditFormSchema })
  formApi.resetForm()
  formApi.setValues({
    nMainAccount: '1',
    nOuterUser: '0'
  })
}

const editInit = async(record: any) => {
  visible.value = true
  type.value = 'edit'
  formApi.setState({ schema: addEditFormSchema })
  formApi.resetForm()
  const res = await requestClient.post<any>('/core/authUser/queryById', { authUser: { id: record.id } })
  if (res.code === 200) {
    formApi.setValues({
      ...res.result,
      nMainAccount: res.result.nMainAccount.toString(),
      nOuterUser: res.result.nOuterUser.toString()
    }, false)
  }
}

const detailInit = (record: any) => {
  editInit(record)
}

defineExpose({
  addInit,
  editInit,
  detailInit
})

// 提交表单
const handleSubmit = async() => {
  const { valid } = await formApi.validate()
  if (!valid) return false
  const values = await formApi.getValues()

  const params = {
    authUser: values
  }
  const res = await requestClient.post<any>(type.value === 'add' ? '/core/authUser/add' : '/core/authUser/edit', params)
    
  if (res.code === 200) {
    Message.success(res.message)
    visible.value = false
    emit('success')
    return true
  } else {
    Message.error(res.message)
    return false
  }
}

// 取消
function handleClose() {
  visible.value = false
}
</script>

<template>
  <Modal
    :model-value="visible"
    :title="type === 'add' ? t('user.addTitle') : t('user.editTitle')"
    :width="600"
    :on-before-ok="handleSubmit"
    @close="handleClose"
  >
    <Form />
  </Modal>
</template>
