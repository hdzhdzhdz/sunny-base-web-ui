<template>
  <div style="display: none;">
    <kunkka-search-dialog
      ref="kunkka-search-dialog"
      top="20px"
      @submitAction="submitAction"
    >
      <template #tableName="{ item, model }">
        <el-select
          v-model="model[item.prop]"
          filterable
          remote
          clearable
          reserve-keyword
          :remote-method="remoteMethod"
          :loading="loading"
          placeholder="根据表名远程搜索"
          @change="search()"
        >
          <el-option
            v-for="op in options"
            :key="op.value"
            :label="op.label"
            :value="op.value"
          />
        </el-select>
      </template>
    </kunkka-search-dialog>
  </div>
</template>

<script>
import { selectForPageTableColumns, findTableName } from '../../../api/resource'

export default {
  data() {
    return {
      options: [],
      loading: false
    }
  },
  methods: {
    openInit({ selection, row, column }) {
      this.$refs['kunkka-search-dialog'].openInit({
        selection: selection, // false单选
        cTitle: '选择实体表', // 标题名称
        api: this.apiFunction, // 接口
        conditions: [
          {
            components: 'Slot',
            label: '表名',
            prop: 'tableName',
            clearable: true,
            required: true,
            lg: 8
          }
        ], // 查询表单配置项
        tableCols: [
          { field: 'columnName', title: '字段名' },
          { field: 'dataType', title: '数据类型' },
          { field: 'comments', title: '注释' }
        ], // 查询表格配置项
        nRows: 20, // 分页返回数目
        fetchPath: {
          listField: 'result.records'
        },
        row,
        column
      })
    },
    search() {
      this.$refs['kunkka-search-dialog'].formSearch(1)
    },
    submitAction(selections, fData) {
      this.$emit('chooseTableEmit', {
        selections, fData
      })
    },
    apiFunction(data) {
      return new Promise((resolve, reject) => {
        var json = {
          'tableColumn': {
            'tableName': data.tableName
          },
          pageNo: data.pageNo,
          pageSize: data.pageSize
        }
        selectForPageTableColumns(json).then(res => {
          resolve(res)
        })
      })
    },
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        findTableName({ 'tableName': { 'name': query }}).then(res => {
          this.options = res.result.map(el => { return { label: el.name, value: el.name } })
        }).finally(() => {
          this.loading = false
        })
      } else {
        this.options = []
      }
    }
  }
}
</script>
