<template>
  <vxe-grid
    ref="editTable"
    v-bind="gridOptions"
    :height="height"
    :data="tableData"
    :columns="columns"
  >
    <template #toolbar>
      <div class="flex justify-between">
        <div class="left-bar">
          <a-dropdown-button size="mini" @click="handleClick" @select="handleCommand">
            新增
            <template #content>
              <a-doption v-for="item in defaultButtons" :key="item.key" :value="item.key">{{ item.value }}</a-doption>
            </template>
          </a-dropdown-button>
        </div>
        <a-space class="right-bar">
          <!-- <a-button size="mini" :loading="loading" @click="pickTable({selection: true})">选择实体表</a-button> -->
          <a-button size="mini" :loading="loading" @click="resetValue">还 原</a-button>
          <a-button status="success" size="mini" :loading="loading" @click="saveResource">保 存</a-button>
        </a-space>
      </div>

      <!-- 弹窗 -->
      <cMetaEditor ref="cMetaEditorRef" @metaEmit="metaEditAction" />
      <!-- <chooseTable ref="chooseTableRef" @chooseTableEmit="chooseTableAction" /> -->
      <!-- <fieldShowRules ref="fieldShowRulesRef" @fieldDynamicEmit="fieldDynamicAction" /> -->
      <!-- <newFieldCallmethod ref="newFieldCallmethodRef" @newFieldCallmethodEdit="newFieldCallmethodAction" /> -->
    </template>
  </vxe-grid>
</template>

<script setup>
import { ref, computed, watch, getCurrentInstance } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { saveButton, saveField } from '../../../api/resource'
import { hasIn, reduce, assign, cloneDeep, find } from 'lodash-es'
import cols from './columns'
import ButtonTemp from '../../../utils/DefaultButtonResource.js'
import cMetaEditor from './cMetaEditor.vue'
// import fieldShowRules from './fieldShowRules.vue'
// import newFieldCallmethod from './newFieldCallmethod.vue'

const props = defineProps({
  moduleInfo: {
    type: Object,
    default: () => ({})
  },
  height: {
    type: Number,
    default: 0
  },
  area: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  },
  presetButton: {
    type: Array,
    default: () => []
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['saveResourceCallback'])

// const router = useRouter()

const loading = ref(false)
const editTable = ref(null)

const cMetaEditorRef = ref()
const chooseTableRef = ref()
const fieldShowRulesRef = ref()
const newFieldCallmethodRef = ref()

const gridOptions = ref({
  border: 'inner',
  keepSource: true,
  showOverflow: true,
  showHeaderOverflow: true,
  loading: false,
  size: 'small',
  minHeight: 500,
  autoResize: true,
  editConfig: {
    trigger: 'click',
    mode: 'row',
    showStatus: false,
    icon: '1'
  },
  columnConfig: {
    useKey: true,
    drag: true,
    resizable: true
  },
  rowConfig: {
    useKey: true,
    drag: true
  },
  rowDragConfig: {
    showIcon: false,
    trigger: 'cell'
  },
  scrollY: {
    enabled: false
  },
  validConfig: {
    showMessage: false
  },
  editRules: {
    cArea: [
      { required: true }
    ],
    cName: [
      { required: true }
    ],
    cLabel: [
      { required: true }
    ],
    cProp: [
      { required: true }
    ],
    cAuth: [
      { required: true }
    ],
    cFieldtype: [
      { required: true }
    ]
  }
})

const columns = computed(() => cols.call({
  type: props.type,
  area: props.area,
  datePickSetMeta,
  setDynamicJson,
  setDynamicI18n,
  pickTable,
  deleteRow,
  insertRow,
  metaEdit,
  setCallmethodsJson
}))

const tableData = ref([])

const defaultButtons = computed(() => {
  const btns = props.type === 'Button' ? reduce(ButtonTemp, function(result, value, key) {
    result.push({
      key: key,
      value: value.cName
    })
    return result
  }, []) : []
  console.log(btns)
  return btns
})

const getTableData = () => {
  let data = []
  if (props.area && props.type) {
    if (hasIn(props.data, `${props.area}.${props.type}`)) {
      data = cloneDeep(props.data[props.area][props.type])
    } else {
      data = []
    }
  } else {
    data = cloneDeep(props.data[props.type])
  }
  data.forEach(item => {
    if (item.cMeta) {
      item.cTip = JSON.parse(item.cMeta)?.tip
    }
  })
  return data
}

watch(() => props.data, () => {
  tableData.value = getTableData()
}, { deep: true, immediate: true })

const saveResource = async () => {
  const $table = editTable.value
  const errMap = await $table.validate(true).catch(errMap => errMap)
  if (errMap) {
    Message.error('校验不通过！')
  } else {
    loading.value = true
    var json = {
      'templatetype': props.moduleInfo.cTemplatetype,
      'area': props.area,
      'parId': props.moduleInfo.id
    }
    if (props.type === 'Button') {
      json['authResButtonList'] = tableData.value.map((td, tn) => {
        return assign({}, td, { nOrder: tn + 1 })
      })
      saveButton(json).then(res => {
        Message[ res.success ? 'success' : 'error']({
          showClose: true,
          content: res.message,
          duration: 3500
        })
        if (res.success) { afterSaveAction() }
      }).finally(() => {
        loading.value = false
      })
    } else if (props.type === 'Field') {
      json['authResFieldList'] = tableData.value.map((td, tn) => {
        if (td.cTip) {
          let cMeta = JSON.parse(td.cMeta)
          if (cMeta) {
            cMeta['tip'] = td.cTip
          } else {
            cMeta = {
              tip: td.cTip
            }
          }
          td.cMeta = JSON.stringify(cMeta)
        }
        return assign({}, td, { nOrder: tn + 1 })
      })
      saveField(json).then(res => {
        Message[res.success ? 'success' : 'error']({
          showClose: true,
          content: res.message,
          duration: 3500
        })
        if (res.success) { afterSaveAction() }
      }).finally(() => {
        loading.value = false
      })
    }
  }
}

const handleCommand = (command) => {
  var cStoremethod = ''
  var bf = props.moduleInfo.cViewpath.substring(0, props.moduleInfo.cViewpath.lastIndexOf('/')).split('/')
  var name = bf[bf.length - 1]
  if (command === 'add' || command === 'edit' || command === 'del') {
    cStoremethod = name + '/' + command
  } else if (command === 'daoru' || command === 'daochu') {
    cStoremethod = command + '/show'
  }
  tableData.value.push(assign({}, ButtonTemp[command], { cArea: props.area }, { cStoremethod: cStoremethod }))
}

const handleClick = () => {
  tableData.value.push({ cArea: props.area })
}

const insertRow = ({ rowIndex }) => {
  tableData.value.splice(rowIndex + 1, 0, { cArea: props.area })
}

const resetValue = () => {
  tableData.value = getTableData()
}

const revertRowData = (row) => {
  const originTable = editTable.value
  originTable.revertData(row)
}

const deleteRow = (index) => {
  tableData.value.splice(index, 1)
}

const metaEdit = (scope) => {
  cMetaEditorRef?.value?.openInit(scope)
}

const metaEditAction = ({ rowIndex, json }) => {
  tableData.value[rowIndex].cMeta = json
}

const afterSaveAction = () => {
  emit('saveResourceCallback', {
    type: props.type,
    area: props.area
  })
}

const datePickSetMeta = ({ row, column }, fieldTypeObj) => {
  if (fieldTypeObj.cMeta) {
    const rowMeta = JSON.parse(row.cMeta || '{}')
    const newMeta = fieldTypeObj.cMeta
    row.cMeta = JSON.stringify({ ...rowMeta, ...newMeta })
  } else {
    const rowMeta = JSON.parse(row.cMeta || '{}')
    delete rowMeta.components
    delete rowMeta.type
    delete rowMeta.valueFormat
    row.cMeta = JSON.stringify({ ...rowMeta })
  }
}

const pickTable = (data) => {
  chooseTable.value.openInit(data)
}

const chooseTableAction = ({ selections, fData }) => {
  if (fData.selection === false) {
    fData.row.cEntityTable = selections.tableName
    fData.row.cEntityCol = selections.columnName
  } else {
    selections.forEach(sl => {
      tableData.value.push({
        cProp: sl.camelColumnName,
        cLabel: sl.comments,
        cArea: props.area,
        cEntityTable: sl.tableName,
        cEntityCol: sl.columnName
      })
    })
  }
}

const setDynamicJson = ({ row, rowIndex, column }) => {
  fieldShowRulesRef.value.openInit({ row, rowIndex, column, tableData: tableData.value })
}

const setDynamicI18n = ({ row, rowIndex, column }) => {
  store.dispatch('i18nDataDialog/showAuthResource', {
    id: row.id,
    cSystem: row.cSystem,
    cName: props.type === 'Button' ? row.cName : row.cLabel,
    nType: props.type === 'Button' ? '2' : 3
  })
}

const fieldDynamicAction = ({ rowIndex, json, field }) => {
  tableData.value[rowIndex][field] = json
}

// 导入/导出配置弹窗
const setCallmethodsJson = ({ row, rowIndex, column }) => {
  newFieldCallmethodRef.value.openInit({ row, rowIndex, column, tableData: tableData.value })
}

const fieldCallmethodAction = ({ rowIndex, json, field }) => {
  tableData.value[rowIndex][field] = json
}

const newFieldCallmethodAction = ({ rowIndex, json, field }) => {
  tableData.value[rowIndex][field] = json
}
</script>