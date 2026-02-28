<template>
  <a-modal
    ref="registerModal"
    v-model:visible="visible"
    :mask-closable="false"
    :unmount-on-close="true"
    draggable
    :title="title"
    width="900px"
  >
    <div style="max-height: 500px; overflow-y: auto; padding: 10px;">
      <rule-group
        v-if="ruleGroup"
        :group="ruleGroup"
        :select-opts="selectOpts"
        :f-data="fData"
        :is-root="true"
        @update:group="val => ruleGroup = val"
      />
    </div>
    <template #footer>
      <a-space>
        <a-button @click="visible = false">取 消</a-button>
        <a-button type="primary" @click="handleOk">确 定</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { initFormItem } from '../../../utils/utils'
import selectOpts from '../../../utils/select-options'
import RuleGroup from './RuleGroup.vue'

interface Rule {
  type: 'rule' | 'group'
  prop?: string
  comparison?: string
  value?: any
  components?: any
  optionlist?: any
  logical?: string
  children?: Rule[]
}

interface FData {
  rowIndex: number | null
  field: string | null
  fieldDatas: any[]
}

interface FieldDynamicEmitData {
  rowIndex: number
  json: string
  field: string
}

const emit = defineEmits<{
  fieldDynamicEmit: [FieldDynamicEmitData]
}>()

const visible = ref(false)
const title = ref('')
const ruleGroup = reactive<Rule>({
  type: 'group',
  logical: '&&',
  children: []
})

const fData = reactive<FData>({
  rowIndex: null,
  field: null,
  fieldDatas: []
})

const registerModal = ref()

const openInit = ({ row, rowIndex, column, tableData }: any) => {
  fData.rowIndex = rowIndex
  fData.field = column.field
  fData.fieldDatas = tableData.map((td: any) => initFormItem(td))

  const val = row[column.field] ? JSON.parse(row[column.field]) : null

  if (Array.isArray(val)) {
    ruleGroup.type = 'group'
    ruleGroup.logical = val.length > 0 && val[0].logical ? val[0].logical : '&&'
    ruleGroup.children = val.map((v: any) => ({
      type: 'rule',
      prop: v.prop,
      comparison: v.comparison,
      value: v.value,
      components: v.components,
      optionlist: v.optionlist
    }))
  } else if (val && val.type === 'group') {
    Object.assign(ruleGroup, val)
  } else {
    ruleGroup.type = 'group'
    ruleGroup.logical = '&&'
    ruleGroup.children = []
  }

  title.value = column.field === 'cDynamicShow' ? '自定义显示/隐藏' : '自定义校验规则'
  visible.value = true
}

const validateGroup = (group: Rule): boolean => {
  if (!group.children) return true

  for (const child of group.children) {
    if (child.type === 'group') {
      if (!validateGroup(child)) return false
    } else {
      if (!child.prop || !child.comparison) {
        return false
      }
    }
  }
  return true
}

const handleOk = async () => {
  if (!validateGroup(ruleGroup)) {
    Message.error('请完善规则配置，字段和比较符为必填项')
    return
  }

  registerModal.value?.changeOkLoading(true)

  let json = ''
  if (ruleGroup.children && ruleGroup.children.length > 0) {
    json = JSON.stringify(ruleGroup)
  }

  emit('fieldDynamicEmit', {
    rowIndex: fData.rowIndex!,
    json: json,
    field: fData.field!
  })

  registerModal.value?.changeOkLoading(false)
  visible.value = false
}

defineExpose({
  openInit
})
</script>
