<template>
  <div class="rule-group">
    <div class="group-header">
      <span class="label">逻辑关系：</span>
      <a-select v-model="localGroup.logical" size="mini" style="width: 80px;">
        <a-option
          v-for="op in selectOpts.logicalOperator"
          :key="op.value"
          :label="op.label"
          :value="op.value"
        />
      </a-select>
      <div class="group-actions">
        <a-button type="text" size="mini" @click="addRule">
          <template #icon><icon-plus /></template>
          添加规则
        </a-button>
        <a-button type="text" size="mini" @click="addGroup">
          <template #icon><icon-folder-add /></template>
          添加分组
        </a-button>
        <a-button v-if="!isRoot" type="text" size="mini" class="delete-btn" @click="emit('remove')">
          <template #icon><icon-delete /></template>
          删除分组
        </a-button>
      </div>
    </div>

    <div class="group-body">
      <div v-for="(item, index) in localGroup.children" :key="index" class="rule-item-wrapper">
        <div v-if="index > 0" class="logical-connector">
          {{ localGroup.logical === '&&' ? '且' : '或' }}
        </div>

        <template v-if="item.type === 'group'">
          <rule-group
            :group="item"
            :select-opts="selectOpts"
            :f-data="fData"
            @remove="removeDevice(index)"
            @update:group="val => updateChild(index, val)"
          />
        </template>
        <template v-else>
          <div class="rule-row">
            <a-auto-complete
              v-model="item.prop"
              :data="autocompleteData"
              clearable
              placeholder="字段"
              size="mini"
              style="width: 200px;"
              @select="(val) => handleSelect(val, item)"
              @change="(val) => handleChange(val, item)"
            >
              <template #default="{ data }">
                <div class="name">{{ data.label }}</div>
              </template>
            </a-auto-complete>

            <a-select v-model="item.comparison" placeholder="比较符" size="mini" style="width: 120px; margin: 0 10px;">
              <a-option
                v-for="op in selectOpts.comparisonOperator"
                :key="op.value"
                :label="op.label"
                :value="op.value"
              />
            </a-select>

            <a-auto-complete
              v-if="item.components === 'Select' && Array.isArray(item.optionlist)"
              v-model="item.value"
              :data="getSelectOptions(item.optionlist)"
              clearable
              placeholder="值"
              size="mini"
              style="width: 200px;"
            >
              <template #default="{ data }">
                <div class="name">{{ data.label }}</div>
              </template>
            </a-auto-complete>
            <a-input
              v-else
              v-model="item.value"
              clearable
              placeholder="值"
              size="mini"
              style="width: 200px;"
            />

            <icon-delete class="delete-icon" @click="removeDevice(index)" />
          </div>
        </template>
      </div>
      <div v-if="localGroup.children.length === 0" class="empty-tip">
        暂无规则，请添加
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { cloneDeep, isEqual } from 'lodash-es'
import { IconPlus, IconFolderAdd, IconDelete } from '@arco-design/web-vue/es/icon'

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

interface SelectOption {
  value: any
  label: string
}

interface FData {
  rowIndex: number | null
  field: string | null
  fieldDatas: any[]
}

const props = defineProps<{
  group: Rule
  selectOpts: {
    logicalOperator: SelectOption[]
    comparisonOperator: SelectOption[]
  }
  fData: FData
  isRoot?: boolean
}>()

const emit = defineEmits<{
  'update:group': [val: Rule]
  remove: []
}>()

const localGroup = ref<Rule>(cloneDeep(props.group))

const autocompleteData = computed<SelectOption[]>(() => {
  const restaurants = props.fData.fieldDatas.map((fd: any) => {
    return {
      label: `${fd.prop}（${fd.label}）`,
      value: fd.prop
    }
  })
  return restaurants
})

const getSelectOptions = (optionlist: any[]): SelectOption[] => {
  return optionlist.map(op => ({
    label: `${op.label}（${op.value}）`,
    value: op.value
  }))
}

watch(
  () => props.group,
  (val) => {
    if (!isEqual(val, localGroup.value)) {
      localGroup.value = cloneDeep(val)
    }
  },
  { deep: true }
)

watch(
  localGroup,
  (val) => {
    emit('update:group', val)
  },
  { deep: true }
)

const addRule = () => {
  localGroup.value.children!.push({
    type: 'rule',
    prop: '',
    comparison: '',
    value: ''
  })
}

const addGroup = () => {
  localGroup.value.children!.push({
    type: 'group',
    logical: '&&',
    children: []
  })
}

const removeDevice = (index: number) => {
  localGroup.value.children!.splice(index, 1)
}

const updateChild = (index: number, val: Rule) => {
  localGroup.value.children![index] = val
}

const handleSelect = (item: any, row: any) => {
}

const handleChange = (val: any, row: any) => {
}
</script>

<style scoped>
.rule-group {
  border: 1px solid var(--color-border-2);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: var(--color-bg-2);
}
.group-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--color-border-1);
}
.group-actions {
  margin-left: auto;
}
.group-actions .arco-btn {
  margin-left: 10px;
}
.delete-btn {
  color: rgb(var(--danger-6));
}
.group-body {
  padding-left: 20px;
}
.rule-item-wrapper {
  position: relative;
  margin-bottom: 10px;
}
.rule-row {
  display: flex;
  align-items: center;
}
.delete-icon {
  margin-left: 10px;
  cursor: pointer;
  color: rgb(var(--danger-6));
}
.logical-connector {
  position: absolute;
  left: -25px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: var(--color-text-3);
  background: var(--color-fill-2);
  padding: 2px 5px;
  border-radius: 2px;
}
.empty-tip {
  color: var(--color-text-3);
  font-size: 12px;
  text-align: center;
  padding: 10px;
}
</style>
