<template>
  <SunnySearchModal
    v-model:visible="visible"
    v-model="selected"
    :title="$t('选择实体表')"
    :form-schema="formSchema"
    :table-columns="tableColumns"
    :search-api="searchApi"
    :field-names="{ label: 'cRolename', value: 'cRolenumb' }"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n();
import { SunnySearchModal } from '@sunny-base-web/ui';
import type { FormSchema } from '@sunny-base-web/ui';
import { requestClient } from '../../../api/request'

const visible = ref(false);
const selected = ref<any[]>([]);
const options = ref([])
const loading = ref(false)
const emit = defineEmits(['chooseRoleEmit'])

const formSchema = [
  {
    fieldName: 'cRolenumb', 
    label: t('user.cRolenumb'), 
    component: 'Input', 
    componentProps: {
      allowClear: true,
    },
    colProps: { span: 6 }
  },
  {
    fieldName: 'cRolename', 
    label: t('user.cRolename'), 
    component: 'Input', 
    componentProps: {
      allowClear: true,
    },
    colProps: { span: 6 }
  }
] as FormSchema[];

const tableColumns = [
  { type: 'checkbox', width: 50, fixed: 'left' },
  { field: 'cRolenumb', title: t('user.cRolenumb'), width: 120 },
  { field: 'cRolename', title: t('user.cRolename'), width: 120 },
  {
    field: 'nSensitive',
    title: t('user.nSensitive'),
    width: 120,
    formatter: ({ row }: any) => row.nSensitive == '1' ? t('common.yes') : t('common.no')
  },
  { field: 'cSystem', title: t('user.cSystem'), width: 120 },
] as any[];

const openInit = () => {
  visible.value = true
}

const handleConfirm = (selections: Record<string, any>[]) => {
  emit('chooseRoleEmit', selections)
}
const searchApi = async (data: any) => {
  var json = {
    authRole: {
      cRolenumb: data.cRolenumb,
      cRolename: data.cRolename
    },
    pageNo: data.pageNo,
    pageSize: data.pageSize
  }
  const res = await requestClient.post<any>('/core/authRole/queryAllPageList', json)
  return { 
    list: res.result.records, 
    total: res.result.total 
  };
}

defineExpose({
  openInit
})
</script>
