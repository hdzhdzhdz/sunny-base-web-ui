<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { Modal, Form, Input, Radio, Button, Select, Message } from '@arco-design/web-vue'
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
        Message.success(addForm.id ? '编辑成功' : '新增成功')
        emit('success')
        quit()
      }
    } catch (error) {
      console.error('保存失败:', error)
      Message.error('保存失败')
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
    :title="addForm.id ? '编辑定时任务' : '新增定时任务'"
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
      <a-form-item label="执行器" field="jobGroup" :rules="[{ required: true, message: '请选择执行器' }]">
        <a-select v-model="addForm.jobGroup" placeholder="请选择执行器">
          <a-option
            v-for="option in jobGroupOptions"
            :key="option.value"
            :value="option.value"
          >{{ option.label }}</a-option>
        </a-select>
      </a-form-item>

      <a-form-item label="任务描述" field="jobDesc" :rules="[{ required: true, message: '请输入任务描述' }]">
        <a-input v-model="addForm.jobDesc" placeholder="请输入任务描述" />
      </a-form-item>

      <a-form-item label="负责人" field="author" :rules="[{ required: true, message: '请输入负责人' }]">
        <a-input v-model="addForm.author" placeholder="请输入负责人" />
      </a-form-item>

      <a-form-item label="报警邮箱" field="alarmEmail">
        <a-input v-model="addForm.alarmEmail" placeholder="请输入报警邮箱" />
      </a-form-item>

      <a-form-item label="调度类型" field="scheduleType" :rules="[{ required: true, message: '请选择调度类型' }]">
        <a-radio-group v-model="addForm.scheduleType">
          <a-radio value="CRON">CRON</a-radio>
          <a-radio value="FIX_RATE">FIX_RATE</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="CRON表达式" field="jobCron" :rules="[{ required: addForm.scheduleType === 'CRON', message: '请输入CRON表达式' }]">
        <a-input v-model="addForm.jobCron" placeholder="请输入CRON表达式" :disabled="addForm.scheduleType !== 'CRON'" />
      </a-form-item>

      <a-form-item label="调度配置" field="scheduleConf" :rules="[{ required: addForm.scheduleType === 'FIX_RATE', message: '请输入调度配置' }]">
        <a-input v-model="addForm.scheduleConf" placeholder="请输入调度配置" :disabled="addForm.scheduleType !== 'FIX_RATE'" />
      </a-form-item>

      <a-form-item label="运行模式" field="glueType" :rules="[{ required: true, message: '请选择运行模式' }]">
        <a-radio-group v-model="addForm.glueType">
          <a-radio value="BEAN">BEAN</a-radio>
          <a-radio value="GLUE_GROOVY">GLUE_GROOVY</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="JobHandler" field="glueSource" :rules="[{ required: true, message: '请输入JobHandler' }]">
        <a-input v-model="addForm.glueSource" placeholder="请输入JobHandler" />
      </a-form-item>

      <a-form-item label="备注" field="glueRemark">
        <a-textarea v-model="addForm.glueRemark" :rows="4" placeholder="请输入备注" />
      </a-form-item>

      <a-form-item label="子任务ID" field="childJobId">
        <a-input v-model="addForm.childJobId" placeholder="请输入子任务ID，多个用逗号分隔" />
      </a-form-item>

      <a-form-item label="任务状态" field="jobStatus" :rules="[{ required: true, message: '请选择任务状态' }]">
        <a-radio-group v-model="addForm.jobStatus">
          <a-radio value="1">启用</a-radio>
          <a-radio value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
    
    <div class="flex justify-end gap-2 mt-4">
      <a-button type="primary" :loading="loading" @click="save">保存</a-button>
      <a-button @click="quit">取消</a-button>
    </div>
  </a-modal>
</template>
