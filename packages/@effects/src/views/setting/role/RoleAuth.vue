<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useSunnyForm, Modal, useSunnyEditGrid } from '@sunny-base-web/ui'
import { findIndex } from 'lodash-es'
import { requestClient } from '../../../api/request'
import { getRoleConfig } from './config'

import RoleChooseUser from './RoleChooseUser.vue'
const RoleChooseUserRef = ref()

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const visible = ref(false)
const currentRole = ref<any>(null)
const originalData = ref<any[]>([]) // 保存原始数据，用于对比新增数据
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
})

const { authFormSchema, authGridColumns } = getRoleConfig({ t, formApi })

const [Grid, gridApi] = useSunnyEditGrid({
  gridOptions: {
    data: [],
    columns: authGridColumns,
    border: true,
    size: 'mini',
    maxHeight: 400,
    columnConfig: {
      resizable: true,
    },
  }
});



const openInit = async(record: any) => {
  visible.value = true
  currentRole.value = record
  formApi.setState({ schema: authFormSchema })
  formApi.resetForm()
  formApi.setValues({
    cRolenumb: record.cRolenumb,
    cRolename: record.cRolename
  })
  
  const res = await requestClient.post<any>('/core/authRole/findRoleUser', { 
    authRole: { id: record.id } 
  })
  if (res.code === 200) {
    const userList = res.result.authUserList || []
    gridApi.reloadData(userList)
    originalData.value = JSON.parse(JSON.stringify(userList)) // 深拷贝保存原始数据
  }
}

defineExpose({
  openInit
})

// 新增用户
const handleAdd = () => {
  RoleChooseUserRef.value.openInit()
}

// 处理选择用户
const handleChooseUser = async (users: any[]) => {
  const data = await gridApi.getFullData();
  users.forEach((item) => {
    if (findIndex(data, (ele: any) => { return ele.id === item.id }) > -1) {
      Message.warning(t('role.duplicateUser', { username: item.cUsername }))
    } else {
      gridApi.addEvent({
        id: item.id,
        cAdmin: item.cAdmin,
        cUsername: item.cUsername,
        cUsernumb: item.cUsernumb
      })
    }
  })
}

// 删除用户
const handleDelete = () => {
  gridApi.deleteSelection();
}

// 提交表单
const handleSubmit = async() => {
  const { valid } = await formApi.validate()
  if (!valid) return false
  const values = await formApi.getValues()
  const tableData = await gridApi.getFullData()
  const deletedData = await gridApi.$grid.getRemoveRecords()
  
  // 找出新增的数据：在当前数据中但不在原始数据中的记录
  const addedData = tableData.filter(current => 
    !originalData.value.some(original => original.id === current.id)
  )

  const params = {
    authRole: { id: currentRole.value.id },
    authUserDelList: deletedData, // 获取角色删除数据
    authUserInsList: addedData // 获取角色新增数据（只包含真正新增的记录）
  }
  
  const res = await requestClient.post<any>('/core/authRole/saveRoleUser', params)
    
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
    :title="t('role.authTitle')"
    :width="700"
    :on-before-ok="handleSubmit"
    @close="handleClose"
  >
    <Form />
    <Grid>
      <template #toolbar>
        <a-space class="mb-2">
          <a-button type="primary" @click="handleAdd">{{ t('common.create') }}</a-button>
          <a-button type="primary" @click="handleDelete">{{ t('common.deleteSelected') }}</a-button>
        </a-space>
      </template>
    </Grid>

    <RoleChooseUser ref="RoleChooseUserRef" @chooseUserEmit="handleChooseUser" />
  </Modal>
</template>