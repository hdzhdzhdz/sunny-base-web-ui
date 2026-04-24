<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { Plus, Trash2 } from '@sunny-base-web/icons'
import { Modal } from '@sunny-base-web/ui'
import { requestClient } from '../../../api/request'
import { useFormTable } from '../../../hooks/useFormTable'
import { addFormSchema, gridColumns, gridEditRules, tableToolbarButtons } from './config'
import type { DataDictionaryFormVO, MetaItem } from './types'

defineOptions({
  name: 'DataDictionaryAdd'
})

interface Props {
  visible: boolean
  parentId?: string
  parentName?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  parentId: '0',
  parentName: ''
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const loading = ref(false)

// 使用集成的表单表格配置
const [Form, formApi, Grid, gridApi] = useFormTable({
  formSchema: addFormSchema,
  tableColumns: gridColumns,
  tableEditRules: gridEditRules,
  tableToolbarButtons: tableToolbarButtons
})

// 监听弹窗打开，重置表单并设置父级字典
watch(() => props.visible, (val) => {
  if (val) {
    formApi.resetForm()
    // 设置父级字典显示名称
    formApi.setValues({
      parentName: props.parentName || '无'
    })
    // 重置额外属性表格
    gridApi.reloadData([])
  }
})

// 弹窗标题
const modalTitle = computed(() => {
  return props.parentId && props.parentId !== '0'
    ? `新增子级字典 - ${props.parentName}`
    : '新增根级字典'
})

// 提交表单
async function handleSubmit() {
  try {
    const { valid } = await formApi.validate()
    if (!valid) return false

    // 校验额外属性表格
    const gridErrMap = await gridApi.validate()
    if (gridErrMap) return false

    // 检查属性键是否重复
    const metaData = await gridApi.getFullData()
    const keys = metaData.filter(item => item.key).map(item => item.key)
    const uniqueKeys = new Set(keys)
    if (keys.length !== uniqueKeys.size) {
      Message.warning('属性键不能重复')
      return false
    }

    const values = await formApi.getValues() as DataDictionaryFormVO

    // 将额外属性转换为 JSON 对象
    const metaObj: Record<string, string> = {}
    metaData.forEach(item => {
      if (item.key) {
        metaObj[item.key] = item.value || ''
      }
    })

    const params = {
      authDict: {
        cXuhao: values.cXuhao,
        cName: values.cName,
        cSign: values.cSign,
        nParent: props.parentId || '0',
        nOrder: values.nOrder || 0,
        cMeta: JSON.stringify(metaObj)
      }
    }

    const res = await requestClient.post<{ message?: string }>('/core/authDict/add', params)
    Message.success(res.message)
    emit('success')
    return true
  } catch (error: any) {
    console.error('新增失败:', error)
    return false
  }
}

// 取消
function handleClose() {
  emit('update:visible', false)
}
</script>

<template>
  <Modal :model-value="props.visible" :title="modalTitle" :width="700" :on-before-ok="handleSubmit"
    @update:model-value="emit('update:visible', $event)" @close="handleClose">
    <Form />
    <!-- <p v-for="item in 500" :key="item"> {{ item }}</p> -->
    <Grid id="metaGrid" border max-height="300" />
  </Modal>
</template>
