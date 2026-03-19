<script setup lang="ts">
import { ref } from 'vue'
import { Modal as ArcoModal, Message } from '@arco-design/web-vue';
import { useSunnyForm, Modal, useSunnyEditGrid, EditRender } from '@sunny-base-web/ui'
import { requestClient } from '../../../api/request'
import { getUserConfig } from './config'
import { findIndex, filter } from 'lodash-es'

import UserChooseRole from './UserChooseRole.vue'
const UserChooseRoleRef = ref()

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const visible = ref(false)
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

const { authFormSchema, authGridColumns } = getUserConfig({ t, formApi })

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
  formApi.setState({ schema: authFormSchema })
  formApi.resetForm()
  formApi.setValues({
    cUsernumb: record.cUsernumb,
    cUsername: record.cUsername
  })
  const res = await requestClient.post<any>('/core/authUser/queryUserRole', { authUser: { id: record.id } })
  if (res.code === 200) {
    gridApi.reloadData(res.result)
  }
}

defineExpose({
  openInit
})

// 提交表单
const handleSubmit = async() => {
  const { valid } = await formApi.validate()
  if (!valid) return false
  const values = await formApi.getValues()
  const tableData = await gridApi.getFullData()

  const params = {
    authorizedNumb: values.cUsernumb,
    authUserRoleList: tableData
  }
  
  const res = await requestClient.post<any>('/core/authUser/saveUserAuth', params)
    
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

const handleAdd = () => {
  // gridApi.addEvent({});
  UserChooseRoleRef.value.openInit()
}

const handleChooseRole = async (roles: any[]) => {
  const data = await gridApi.getFullData();
  roles.forEach((item) => {
    if (findIndex(data, (ele: any) => { return ele.nRoleid === item.id }) > -1) {
      Message.warning(t('user.duplicateRole', { roleName: item.cRolename }))
    } else {
      gridApi.addEvent({
        nRoleid: item.id,
        cSystem: item.cSystem,
        cRolename: item.cRolename,
        cRolenumb: item.cRolenumb,
        nSensitive: item.nSensitive
      })
    }
  })
}

const handleDelete = () => {
  gridApi.deleteSelection();
}
</script>

<template>
  <Modal
    :model-value="visible"
    :title="t('user.authTitle')"
    :width="700"
    :on-before-ok="handleSubmit"
    @close="handleClose"
  >
    <Form />
    <Grid>
      <template #toolbar>
        <a-space class="mb-2">
          <a-button type="primary" @click="handleAdd">新增</a-button>
          <a-button type="primary" @click="handleDelete">删除选中</a-button>
        </a-space>
      </template>
    </Grid>

    <UserChooseRole ref="UserChooseRoleRef" @chooseRoleEmit="handleChooseRole" />
  </Modal>
</template>
