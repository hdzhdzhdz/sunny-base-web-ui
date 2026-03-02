<template>
  <SunnySearchModal
    v-model:visible="visible"
    v-model="selected"
    :title="$t('选择实体表')"
    :form-schema="formSchema"
    :table-columns="tableColumns"
    :search-api="searchApi"
    :field-names="{ label: 'tableName', value: 'columnName', desc: 'comments' }"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n();
import { selectForPageTableColumns, findTableName } from '../../../api/resource'
import { SunnySearchModal } from '@sunny-base-web/ui';
import type { FormSchema } from '@sunny-base-web/ui';

const visible = ref(false);
const selected = ref<any[]>([]);
const options = ref([])
const loading = ref(false)
const emit = defineEmits(['chooseTableEmit'])

const formSchema = [
  { 
    fieldName: 'tableName', 
    label: t('表名'), 
    rules: 'required',
    component: 'Select', 
    componentProps: {
      options: options,
      allowClear: true,
      allowSearch: true,
      filterOption: false,
      showExtraOptions: false,
      onSearch: (value: string) => {
        if (value !== '') {
          loading.value = true
          findTableName({ 'tableName': { 'name': value }}).then(res => {
            options.value = res.result.map((el: any) => { return { label: el.name, value: el.name } })
          }).finally(() => {
            loading.value = false
          })
        } else {
          options.value = []
        }
      },
      onChange: (val: string) => {
        console.log(val)
      }
    }
  }
] as FormSchema[];

const tableColumns = [
  { type: 'checkbox', width: 50, fixed: 'left' },
  { field: 'columnName', title: '字段名', width: 120 },
  { field: 'dataType', title: '数据类型', width: 120 },
  { field: 'comments', title: '注释', width: 120 },
] as any[];

const openInit = () => {
  visible.value = true
}

const handleConfirm = (selections: Record<string, any>[]) => {
  emit('chooseTableEmit', selections)
}
const searchApi = async (data: any) => {
  var json = {
    'tableColumn': {
      'tableName': data.tableName
    },
    pageNo: data.pageNo,
    pageSize: data.pageSize
  }
  const { result }: any = await selectForPageTableColumns(json)
  return { 
    list: result.records, 
    total: result.total 
  };
}

defineExpose({
  openInit
})
</script>
