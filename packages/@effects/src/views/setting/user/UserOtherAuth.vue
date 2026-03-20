<template>
  <Modal
    :model-value="visible"
    :title="t('user.otherAuth.title')"
    :width="900"
    class="macAddressDialog"
    :on-before-ok="handleSubmit"
    @close="handleClose"
  >
    <div>
      <table
        class="otherAuthTable"
      >
        <caption />
        <th class="th1">{{ t('user.otherAuth.tab') }}</th>
        <th class="th2">{{ t('user.otherAuth.tabDesc') }}</th>
        <th class="th3">{{ t('user.otherAuth.option') }}</th>
        <tr v-for="item in tableData">
          <td class="tr1">{{ item.parname }}</td>
          <td class="tr2">
            <a-checkbox v-model="item.allCheck" @change="(checked: boolean) => allCheck(checked, item.authExresList)" />
            是
          </td>
          <td class="tr3">
            <a-checkbox 
              v-for="item2 in item.authExresList" 
              v-model="item2.check"
            >
              {{ item2.cExresnum + '-' + item2.cExresname }}
              <span v-if="item2.cOrg" style="color:#24b77b">[{{ item2.cOrg }}]</span>
            </a-checkbox>
          </td>
        </tr>
      </table>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue';
import { Modal } from '@sunny-base-web/ui'
import { requestClient } from '../../../api/request'

interface AuthExresItem {
  check: boolean
  cExresnum: string
  cExresname: string
  cOrg?: string
}

interface TableItem {
  parname: string
  parnum: string
  allCheck: boolean
  authExresList: AuthExresItem[]
}

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const visible = ref(false)
const tableData = ref<TableItem[]>([])
const userRecord = ref<any>({})
const emit = defineEmits<{
  success: []
}>()

const allCheck = (checked: boolean, authExresList: AuthExresItem[]) => {
  authExresList.forEach(element => {
    element.check = !!checked
  })
}

const openInit = async(record: any) => {
  visible.value = true
  const res = await requestClient.post<any>('/core/authUser/queryUserExres', { authUser: { id: record.id } })
  if (res.code === 200) {
    tableData.value = res.result
    userRecord.value = record
  }
}

defineExpose({
  openInit
})

// 提交表单
const handleSubmit = async() => {
  const jsonStr = {
    authUser: { id: userRecord.value.id },
    userExresAuthBOList: tableData.value.map((item) => {
      return {
        ...item,
        allCheck: false // check ALL先初期全部舍弃，都为false
      }
    })
  }
  
  const res = await requestClient.post<any>('/core/authUser/saveUserExres', jsonStr)
    
  if (res.code === 200) {
    Message.success(res.message)
    visible.value = false
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

<style lang="scss" scoped>
tr.elx-body--row {
  cursor: pointer;
}

.otherAuthTable {
  width: 100%;
  text-align: center;
  border-spacing: 0;
  border-top: 1px solid #000;
  border-right: 1px solid #000;
  border-left: 1px solid #000;
}

.otherAuthTable td {
  padding: 10px;
  border-bottom: 1px solid #000;
  border-right: 1px solid #000;
}

.otherAuthTable .a-checkbox {
  margin-bottom: 5px;
}

.th1 {
  height: 40px;
  line-height: 40px;
  width: 9%;
  text-align: center;
  border-bottom: 1px solid #000;
  border-right: 1px solid #000;
}

.th2 {
  height: 40px;
  line-height: 40px;
  width: 9%;
  text-align: center;
  border-bottom: 1px solid #000;
  border-right: 1px solid #000;
}

.th3 {
  height: 40px;
  line-height: 40px;
  width: 82%;
  text-align: center;
  border-bottom: 1px solid #000;
  border-right: 1px solid #000;
}

.tr1 {
  height: 40px;
  width: 9%;
  text-align: center;
}

.tr2 {
  height: 40px;
  width: 9%;
  text-align: center;
}

.tr3 {
  height: 40px;
  width: 82%;
  text-align: center;
}
</style>