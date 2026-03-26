<template>
  <SunnySearchModal
    v-model:visible="visible"
    v-model="selected"
    :title="t('role.userSearch')"
    :form-schema="formSchema"
    :table-columns="tableColumns"
    :search-api="searchApi"
    :field-names="{ label: 'cUsername', value: 'id' }"
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
const emit = defineEmits(['chooseUserEmit'])

const formSchema = [
  {
    fieldName: 'cUsernumb', 
    label: t('user.cUsernumb'), 
    component: 'Input', 
    componentProps: {
      allowClear: true,
      placeholder: t('role.inputPlaceholder')
    },
    colProps: { span: 12 }
  },
  {
    fieldName: 'cUsername', 
    label: t('user.cUsername'), 
    component: 'Input', 
    componentProps: {
      allowClear: true,
      placeholder: t('role.inputPlaceholder')
    },
    colProps: { span: 12 }
  }
] as FormSchema[];

const tableColumns = [
  { type: 'checkbox', width: 50, fixed: 'left' },
  { field: 'cUsernumb', title: t('user.cUsernumb'), width: 120 },
  { field: 'cUsername', title: t('user.cUsername'), width: 120 },
  { field: 'cDeptname', title: t('user.cDeptname'), width: 120 },
  { field: 'cJobname', title: t('role.jobname'), width: 120 }
] as any[];

const openInit = () => {
  visible.value = true
}

const handleConfirm = (selections: Record<string, any>[]) => {
  emit('chooseUserEmit', selections)
}

const searchApi = async (data: any) => {
  var json = {
    authUser: {
      cUsernumb: data.cUsernumb || '',
      cUsername: data.cUsername || ''
    },
    pageNo: data.pageNo,
    pageSize: data.pageSize
  }
  const res = await requestClient.post<any>('/core/authUser/selectForPage', json)
  return { 
    list: res.result.records, 
    total: res.result.total 
  };
}

defineExpose({
  openInit
})
</script>