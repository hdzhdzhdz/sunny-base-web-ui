<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import { useSunnyForm, Modal } from '@sunny-base-web/ui'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
  cNum: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const [Form, formApi] = useSunnyForm({
  layout: 'vertical',
  size: 'small',
  labelWidth: 120,
  showDefaultActions: false,
  scrollToFirstError: true,
  schema: [
    {
      fieldName: 'businessSearchValue',
      label: '业务搜索',
      component: 'SunnyBusinessSearch',
      componentProps: () => ({
        cNum: props.cNum, // 使用传入的cNum值
        placeholder: '请选择',
        modalProps: {
          multiple: true,
          fieldNames: {
            label: 'LASTNAME',
            value: 'WORKCODE'
          }
        }
      }),
      colProps: { span: 8 }
    }
  ]
})

// 监听弹窗显示状态，打开时清空表单
watch(() => props.visible, (newVal) => {
  if (newVal) {
    formApi.resetForm()
  }
})

// 提交表单
const handleSubmit = async () => {
  const { valid } = await formApi.validate()
  if (!valid) return false
  
  // 提交成功后关闭弹窗
  emit('close')
  return true
}

// 取消
const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Modal
    :model-value="visible"
    title="预览查询弹窗"
    :on-before-ok="handleSubmit"
    @close="handleClose"
    width="800px"
  >
    <Form />
  </Modal>
</template>