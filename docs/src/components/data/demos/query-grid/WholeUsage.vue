<script lang="tsx" setup>
import { reactive } from 'vue'
import type { VxeGridProps, VxeGridListeners } from 'vxe-table'
import { useKunkkaQueryGrid } from "@sunny-base-web/ui";
import { Modal, Message } from '@arco-design/web-vue';

interface RowVO {
  id: number
  name: string
  nickname: string
  role: string
  sex: string
  age: number
  address: string
}

// 模拟查询接口
const fetchApi = (page: { currentPage: number, pageSize: number }, queryParams?: any) => {
  return new Promise(resolve => {
    const { currentPage, pageSize } = page
    console.log('fetchApi queryParams:', queryParams)
    setTimeout(() => {
      const list = Array.from({ length: 1000 }, (_, i) => ({
        id: 10001 + i,
        name: `Test${i + 1}`,
        nickname: `T${i + 1}`,
        role: '0',
        sex: 'Man',
        age: 28,
        address: 'Shenzhen'
      }))
      resolve({
        page: {
          total: list.length
        },
        result: list.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      })
    }, 100)
  })
}

const formatOption = ({ cellValue, column }: any) => {
  if (column.params.optionlist) {
    const item = column.params.optionlist.find((opt: any) => opt.value === cellValue)
    return item ? item.label : cellValue
  }
  return cellValue
}

const queryParams = reactive<Record<string, any>>({})

const gridOptions = reactive<VxeGridProps<RowVO>>({
  id: 'queryList-grid',
  border: true,
  showOverflow: 'title',
  keepSource: true,
  size: 'mini',
  height: 500,
  columnConfig: {
    resizable: true
  },
  pagerConfig: {
    enabled: true,
    pageSize: 100
  },
  rowConfig: {
    keyField: 'id'
  },
  checkboxConfig: {
    reserve: true, // 分页保留选中状态
    showReserveStatus: true // 分页显示保留选中状态
  },
  toolbarConfig: {
    zoom: true,
    custom: true,
    buttons: [
      { name: '新增', code: 'myAdd', status: 'primary' },
      { name: '修改', code: 'myEdit', status: 'success' },
      { name: '删除', code: 'myDel', status: 'error' },
      { name: '详情', code: 'myDetail' }
    ]
  },
  customConfig: {
    mode: 'popup',
    storage: true,
    updateStore: (params: any) => {
      console.log(params)
      if (params.type === 'confirm') {
        // 服务端保存-调用接口
        Message.info('服务端保存')
      }
    },
    visibleMethod: (params: any) => { // 在个性化列弹窗中，不显示 checkbox 和 seq 列
      return !(params.column.type === 'checkbox' || params.column.type === 'seq')
    }
  },
  filterConfig: {
    remote: true // 使用服务端筛选,不对数据进行处理
  },
  proxyConfig: {
    response: {
      result: 'result',
      total: 'page.total'
    },
    ajax: {
      // 接收 Promise
      query: ({ page }: any, customParams: any) => {
        const params = { ...queryParams, ...customParams }
        return fetchApi(page, params)
      }
    }
  },
  columns: [
    { type: 'checkbox', width: 40, align: 'center', fixed: 'left' },
    { type: 'seq', width: 40, align: 'center', fixed: 'left' },
    { field: 'name', title: 'Name', width: '25%' },
    {
      field: 'nickname', title: 'Nickname', width: '25%',
      filters: [{ data: '' }], filterRender: { name: 'MyFilterComplex' } 
    },
    {
      field: 'role',
      title: 'Role',
      width: '25%',
      formatter: formatOption,
      params: { optionlist: [{ value: '0', label: 'Develop' }, { value: '1', label: 'Admin' }] },
      filters: [{ data: '' }], filterRender: { name: 'MyFilterComplex' } 
    },
    { field: 'address', title: 'Address', width: '50%' }
  ]
})

const gridEvents: VxeGridListeners = {
  toolbarButtonClick (params: any) {
    console.log(params)
    const selectRecords = [
      ...params.$grid.getCheckboxReserveRecords(), // 保留选中的记录
      ...params.$grid.getCheckboxRecords() // 当前选中的记录
    ]
    switch (params.button.code) {
      case 'myAdd':
        Message.info(params.button.name)
        break
      case 'myDel': {
        if (selectRecords.length === 0) {
          Message.warning('请至少选择一条记录！')
          return
        }
        Modal.confirm({
          title: '提示',
          content: `确定删除选中 ${selectRecords.length} 项吗？`,
          onBeforeOk: async () => {
            // 调用删除接口
            await new Promise(resolve => setTimeout(resolve, 3000));
            // 刷新表格数据
            params.$grid.commitProxy('query', {})
            return true;
          }
        });
        break
      }
      case 'myEdit':
        if (selectRecords.length !== 1) {
          Message.warning('请选择一条记录！')
          return
        }
        Message.info(`${params.button.name}：${JSON.stringify(selectRecords[0])}`)
        break
      case 'myDetail':
        if (selectRecords.length !== 1) {
          Message.warning('请选择一条记录！')
          return
        }
        Message.info(`${params.button.name}：${JSON.stringify(selectRecords[0])}`)
        break
    }
  }
}

const [Grid, gridApi] = useKunkkaQueryGrid({ gridOptions, gridEvents });

</script>

<template>
  <div class="h-full w-full overflow-hidden vp-raw">
    <Grid />
  </div>
</template>