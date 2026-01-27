<script lang="ts" setup>
import { reactive } from 'vue'
import type { VxeGridProps, VxeGridListeners } from 'vxe-table'
import { useKunkkaQueryGrid } from "@kunkka/ui";

// 扩展 VxeGridProps
type ExtendedVxeGridProps<D = any> = VxeGridProps<D> & {
  // 在这里添加你的自定义属性
}

interface RowVO {
  id: number
  name: string
  nickname: string
  role: string
  sex: string
  age: number
  address: string
}

// 模拟后台接口
const fetchApi = (currentPage: number, pageSize: number) => {
  return new Promise(resolve => {
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

// 模拟后台接口
const delApi = (removeRecords: RowVO[]) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        result: [],
        msg: `delete，${removeRecords.length}条`
      })
    }, 100)
  })
}

// 模拟后台接口
const saveApi = (insertRecords: RowVO[]) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        result: [],
        msg: `success, ${insertRecords.length}条`
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

const gridOptions = reactive<ExtendedVxeGridProps<RowVO>>({
  border: true,
  showOverflow: 'title',
  sticky: true, // 是否开启吸顶
  keepSource: true,
  size: 'mini',
  // height: 500,
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
    reserve: true
  },
  toolbarConfig: {
    zoom: true,
    custom: true,
    buttons: [
      { name: '新增', code: 'myAdd', status: 'primary' },
      { name: '删除', code: 'myDel', status: 'error' },
      { name: '保存', code: 'mySave', status: 'success' }
    ]
  },
  proxyConfig: {
    response: {
      result: 'result',
      total: 'page.total'
    },
    ajax: {
      // 接收 Promise
      query: ({ page }) => {
        return fetchApi(page.currentPage, page.pageSize)
      },
      // body 对象： { removeRecords }
      delete: ({ body }) => {
        return delApi(body.removeRecords)
      },
      // body 对象： { insertRecords, updateRecords, removeRecords, pendingRecords }
      save: ({ body }) => {
        return saveApi(body.insertRecords)
      }
    }
  },
  columns: [
    { type: 'checkbox', width: 40, align: 'center' },
    { type: 'seq', width: 70 },
    { field: 'name', title: 'Name', width: '25%' },
    { field: 'nickname', title: 'Nickname', width: '25%' },
    {
      field: 'role',
      title: 'Role',
      width: '25%',
      formatter: formatOption,
      params: { optionlist: [{ value: '0', label: 'Develop' }, { value: '1', label: 'Admin' }] },
      // filters: [{ data: '' }],
      filterRender: {
        name: 'VxeSelect',
        options: [{ value: '0', label: 'Develop' }, { value: '1', label: 'Admin' }]
      }
    },
    { field: 'address', title: 'Address', width: '50%' }
  ]
})

const gridEvents: VxeGridListeners = {
  toolbarButtonClick (params) {
    console.log(params)
  }
}

const [Grid, gridApi] = useKunkkaQueryGrid({ gridOptions, gridEvents });

</script>

<template>
  <div class="h-full w-full overflow-hidden vp-raw">
    <div class="bg-green-300 h-[200px]"></div>
    <!-- <div style="height: calc(100vh - 200px); overflow: auto; position: relative;"> -->
      <Grid />
    <!-- </div> -->
    <div class="bg-green-300 h-[1000px]"></div>
  </div>
</template>
