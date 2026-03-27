<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { Modal, Form, Input, Radio, Button, Select, Message, Divider } from '@arco-design/web-vue'
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
  id: '',
  jobGroup: '',
  jobDesc: '',
  author: '',
  alarmEmail: '',
  scheduleType: 'CRON',
  jobCron: '',
  scheduleConf: '',
  glueType: 'BEAN',
  glueSource: '',
  glueRemark: '',
  childJobId: '',
  jobStatus: '1'
})

// 执行器列表
const jobGroupOptions = ref<any[]>([])

// 加载状态
const loading = ref(false)

// 获取执行器列表
const getJobGroupList = async () => {
  try {
    const response = await requestClient.post('/schedule/jobinfo/findJobGroup', {})
    if (response.success && response.data) {
      jobGroupOptions.value = response.data.map((item: any) => ({
        label: item.title,
        value: item.id
      }))
    }
  } catch (error) {
    console.error('获取执行器列表失败:', error)
  }
}

// 监听表单数据变化
watch(() => props.formData, (newData) => {
  if (newData) {
    Object.assign(addForm, newData)
  }
}, { deep: true })

// 组件挂载时获取执行器列表
onMounted(() => {
  getJobGroupList()
})

// 保存表单
const save = async () => {
  if (!formRef.value) return
  
  formRef.value.validate().then(async () => {
    loading.value = true
    
    try {
      let response
      if (addForm.id) {
        // 修改
        response = await requestClient.post('/schedule/jobinfo/update', addForm)
      } else {
        // 新增
        response = await requestClient.post('/schedule/jobinfo/add', addForm)
      }
      
      if (response.success) {
        Message.success(addForm.id ? t('jobinfo.editSuccess') : t('jobinfo.addSuccess'))
        emit('success')
        quit()
      }
    } catch (error) {
      console.error('保存失败:', error)
      Message.error(t('jobinfo.saveFailed'))
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
    id: '',
    jobGroup: '',
    jobDesc: '',
    author: '',
    alarmEmail: '',
    scheduleType: 'CRON',
    jobCron: '',
    scheduleConf: '',
    glueType: 'BEAN',
    glueSource: '',
    glueRemark: '',
    childJobId: '',
    jobStatus: '1'
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
        id: '',
        jobGroup: '',
        jobDesc: '',
        author: '',
        alarmEmail: '',
        scheduleType: 'CRON',
        jobCron: '',
        scheduleConf: '',
        glueType: 'BEAN',
        glueSource: '',
        glueRemark: '',
        childJobId: '',
        jobStatus: '1'
      })
    }
    emit('update:visible', true)
  }
})
</script>

<template>
  <a-modal
    :title="addForm.id ? t('jobinfo.editTitle') : t('jobinfo.addTitle')"
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
      <!-- 基础配置 -->
      <a-divider :content-position="left">{{ t('jobinfo.basicConfig') }}</a-divider>

      <a-form-item :label="t('jobinfo.executor')" field="jobGroup" :rules="[{ required: true, message: t('jobinfo.selectExecutor') }]">
        <a-select v-model="addForm.jobGroup" :placeholder="t('jobinfo.selectExecutor')">
          <a-option
            v-for="option in jobGroupOptions"
            :key="option.value"
            :value="option.value"
          >{{ option.label }}</a-option>
        </a-select>
      </a-form-item>

      <a-form-item :label="t('jobinfo.jobDesc')" field="jobDesc" :rules="[{ required: true, message: t('jobinfo.inputJobDesc') }]">
        <a-input v-model="addForm.jobDesc" :placeholder="t('jobinfo.inputJobDesc')" />
      </a-form-item>

      <a-form-item :label="t('jobinfo.author')" field="author" :rules="[{ required: true, message: t('jobinfo.inputAuthor') }]">
        <a-input v-model="addForm.author" :placeholder="t('jobinfo.inputAuthor')" />
      </a-form-item>

      <a-form-item :label="t('jobinfo.alarmEmail')" field="alarmEmail">
        <a-input v-model="addForm.alarmEmail" :placeholder="t('jobinfo.inputAlarmEmail')" />
      </a-form-item>

      <!-- 调度配置 -->
      <a-divider :content-position="left">{{ t('jobinfo.scheduleConfig') }}</a-divider>

      <a-form-item :label="t('jobinfo.scheduleType')" field="scheduleType" :rules="[{ required: true, message: t('jobinfo.selectScheduleType') }]">
        <a-radio-group v-model="addForm.scheduleType">
          <a-radio value="CRON">{{ t('jobinfo.cron') }}</a-radio>
          <a-radio value="FIX_RATE">{{ t('jobinfo.fixedRate') }}</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item :label="t('jobinfo.cronExpression')" field="jobCron" :rules="[{ required: addForm.scheduleType === 'CRON', message: t('jobinfo.inputCronExpression') }]">
        <a-input v-model="addForm.jobCron" :placeholder="t('jobinfo.inputCronExpression')" :disabled="addForm.scheduleType !== 'CRON'" />
      </a-form-item>

      <a-form-item :label="t('jobinfo.scheduleConf')" field="scheduleConf" :rules="[{ required: addForm.scheduleType === 'FIX_RATE', message: t('jobinfo.inputScheduleConf') }]">
        <a-input v-model="addForm.scheduleConf" :placeholder="t('jobinfo.inputScheduleConf')" :disabled="addForm.scheduleType !== 'FIX_RATE'" />
      </a-form-item>

      <!-- 任务配置 -->
      <a-divider :content-position="left">{{ t('jobinfo.jobConfig') }}</a-divider>

      <a-form-item :label="t('jobinfo.glueType')" field="glueType" :rules="[{ required: true, message: t('jobinfo.selectGlueType') }]">
        <a-radio-group v-model="addForm.glueType">
          <a-radio value="BEAN">{{ t('jobinfo.bean') }}</a-radio>
          <a-radio value="GLUE_GROOVY">{{ t('jobinfo.glueJava') }}</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item :label="t('jobinfo.jobHandler')" field="glueSource" :rules="[{ required: true, message: t('jobinfo.inputJobHandler') }]">
        <a-input v-model="addForm.glueSource" :placeholder="t('jobinfo.inputJobHandler')" />
      </a-form-item>

      <a-form-item :label="t('jobinfo.remark')" field="glueRemark">
        <a-textarea v-model="addForm.glueRemark" :rows="4" :placeholder="t('jobinfo.inputRemark')" />
      </a-form-item>

      <a-form-item :label="t('jobinfo.childJobId')" field="childJobId">
        <a-input v-model="addForm.childJobId" :placeholder="t('jobinfo.inputChildJobId')" />
      </a-form-item>

      <a-form-item :label="t('jobinfo.jobStatus')" field="jobStatus" :rules="[{ required: true, message: t('jobinfo.selectJobStatus') }]">
        <a-radio-group v-model="addForm.jobStatus">
          <a-radio value="1">{{ t('jobinfo.enable') }}</a-radio>
          <a-radio value="0">{{ t('jobinfo.disable') }}</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
    
    <div class="flex justify-end gap-2 mt-4">
      <a-button type="primary" :loading="loading" @click="save">{{ t('jobinfo.save') }}</a-button>
      <a-button @click="quit">{{ t('jobinfo.cancel') }}</a-button>
    </div>
  </a-modal>
</template>
