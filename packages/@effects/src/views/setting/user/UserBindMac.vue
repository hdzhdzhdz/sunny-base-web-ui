<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue';
import { Modal, useSunnyEditGrid } from '@sunny-base-web/ui'
import { requestClient } from '../../../api/request'
import { getUserConfig } from './config'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const visible = ref(false)
const useInfo = ref<any>({})
const emit = defineEmits<{
  success: []
}>()

const { bindMacGridColumns } = getUserConfig({ t })

const [Grid, gridApi] = useSunnyEditGrid({
  gridOptions: {
    data: [],
    columns: bindMacGridColumns,
    border: true,
    size: 'mini',
    maxHeight: 400,
    columnConfig: {
      resizable: true,
    },
    editConfig: {
      enabled: true,
      trigger: 'click',
      mode: 'row'
    },
    editRules: {
      cMac: [{ required: true, message: t('user.cMacMessage') }],
    },
  }
});

const openInit = async(record: any) => {
  visible.value = true
  const res = await requestClient.post<any>('/core/authUser/queryMac', { cUsernumb: record.cUsernumb })
  if (res.code === 200) {
    useInfo.value = record
    gridApi.reloadData(res.result)
  }
}

defineExpose({
  openInit
})

// 提交表单
const handleSubmit = async() => {
  // 校验表格数据
  const errMap = await gridApi.validate();
  if (errMap) {
    return false
  }
  const tableData = await gridApi.getFullData()

  const params = {
    authUserMacList: tableData,
    authUserMac: {
      cUsernumb: useInfo.value.cUsernumb
    }
  }
  
  const res = await requestClient.post<any>('/core/authUser/saveMac', params)
    
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
  gridApi.addEvent({});
}

const handleDelete = () => {
  gridApi.deleteSelection();
}
</script>

<template>
  <Modal
    :model-value="visible"
    :title="t('user.bindMacTitle')"
    :width="700"
    :on-before-ok="handleSubmit"
    @close="handleClose"
  >
    <Grid>
      <template #toolbar>
        <a-space class="mb-2">
          <a-button type="primary" @click="handleAdd">{{ t('common.create') }}</a-button>
          <a-button type="primary" @click="handleDelete">{{ t('common.deleteSelected') }}</a-button>
        </a-space>
      </template>
    </Grid>
  </Modal>
</template>
