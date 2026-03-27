<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Modal, Form, Input, Radio, Button, Message } from '@arco-design/web-vue'
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
const addForm = reactive({
  appname: '',
  title: '',
  addressType: '0',
  addressList: '',
  id: ''
})

// 注册方式选项
const options = {
  zcfsOpts: [
    { cKeyname: t('jobgroup.autoRegister'), cKeynumb: '0' },
    { cKeyname: t('jobgroup.manualEntry'), cKeynumb: '1' }
  ]
}

// 加载状态
const loading = ref(false)

// 监听表单数据变化
watch(() => props.formData, (newData) => {
  if (newData) {
    Object.assign(addForm, newData)
  }
}, { deep: true })

// 保存表单
const save = async () => {
  if (!formRef.value) return
  
  formRef.value.validate().then(async () => {
    loading.value = true
    
    try {
      let response
      if (addForm.id) {
        // 修改
        response = await requestClient.post('/schedule/jobgroup/update', addForm)
      } else {
        // 新增
        response = await requestClient.post('/schedule/jobgroup/save', addForm)
      }
      
      if (response.success) {
        Message.success(addForm.id ? t('jobgroup.editSuccess') : t('jobgroup.addSuccess'))
        emit('success')
        quit()
      }
    } catch (error) {
      console.error('保存失败:', error)
      Message.error(t('jobgroup.saveFailed'))
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
  Object.assign(addForm, {
    appname: '',
    title: '',
    addressType: '0',
    addressList: '',
    id: ''
  })
  emit('update:visible', false)
}

// 暴露方法给父组件
defineExpose({
  show: (data?: any) => {
    if (data) {
      Object.assign(addForm, data)
    } else {
      // 重置表单
      Object.assign(addForm, {
        appname: '',
        title: '',
        addressType: '0',
        addressList: '',
        id: ''
      })
    }
    emit('update:visible', true)
  }
})
</script>

<template>
  <a-modal
    :title="addForm.id ? t('jobgroup.editTitle') : t('jobgroup.addTitle')"
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    :mask-closable="false"
    :closable="false"
    width="900px"
    :footer="false"
  >
    <a-form
      ref="formRef"
      :model="addForm"
      :label-width="130"
    >
      <a-form-item :label="t('jobgroup.appname')" field="appname" :rules="[{ required: true, message: t('jobgroup.inputAppname') }]">
        <a-input v-model="addForm.appname" :placeholder="t('jobgroup.inputAppname')" />
      </a-form-item>

      <a-form-item :label="t('jobgroup.title')" field="title" :rules="[{ required: true, message: t('jobgroup.inputTitle') }]">
        <a-input v-model="addForm.title" :placeholder="t('jobgroup.inputTitle')" />
      </a-form-item>

      <a-form-item :label="t('jobgroup.registerType')" field="addressType" :rules="[{ required: true, message: t('jobgroup.selectRegisterType') }]">
        <a-radio-group v-model="addForm.addressType">
          <a-radio
            v-for="opt in options.zcfsOpts"
            :key="opt.cKeynumb"
            :value="opt.cKeynumb"
          >{{ opt.cKeyname }}</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item 
        :label="t('jobgroup.machineAddress')" 
        field="addressList" 
        :rules="[{ required: addForm.addressType === '1', message: t('jobgroup.inputMachineAddress') }]"
      >
        <a-textarea
          v-model="addForm.addressList"
          :rows="4"
          :max-rows="8"
          :disabled="addForm.addressType === '0'"
          :placeholder="t('jobgroup.inputMachineAddressList')"
        />
      </a-form-item>
    </a-form>
    
    <div class="flex justify-end gap-2 mt-4">
      <a-button type="primary" :loading="loading" @click="save">{{ t('jobgroup.save') }}</a-button>
      <a-button @click="quit">{{ t('jobgroup.cancel') }}</a-button>
    </div>
  </a-modal>
</template>
