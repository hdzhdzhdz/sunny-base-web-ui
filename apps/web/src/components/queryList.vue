<script lang="tsx" setup>
import { reactive } from 'vue'
import type { VxeGridProps, VxeGridListeners } from 'vxe-table'
import { useKunkkaQueryGrid } from "@kunkka/ui";
import { Modal, Message, Input } from '@arco-design/web-vue';
import CustomHeader from './CustomHeader.vue';

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
const fetchApi = (currentPage: number, pageSize: number, queryParams?: any) => {
  return new Promise(resolve => {
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

const queryParams = reactive<Record<string, any>>({})

const gridOptions = reactive<ExtendedVxeGridProps<RowVO>>({
  id: 'queryList-grid',
  border: true,
  showOverflow: 'title',
  // sticky: true, // 是否开启吸顶
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
    reserve: true, // 分页保留选中状态
    showReserveStatus: true // 分页显示保留选中状态
  },
  toolbarConfig: {
    zoom: true,
    custom: true,
    buttons: [
      { name: '新增', code: 'myAdd', status: 'primary' },
      { name: '删除', code: 'myDel', status: 'error' },
      { name: '保存', code: 'mySave', status: 'success' },
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
    visibleMethod: (params: any) => {
      return !(params.column.type === 'checkbox' || params.column.type === 'seq')
    }
  },
  proxyConfig: {
    response: {
      result: 'result',
      total: 'page.total'
    },
    ajax: {
      // 接收 Promise
      query: ({ page }: any, customParams: any) => {
        // 合并分页参数和自定义查询参数
        // 当通过 gridOptions.proxyConfig?.ajax?.query?.(...) 手动调用时，customParams 会包含传递的额外参数
        // 当通过表格内部（如翻页）调用时，customParams 可能为空，此时使用 queryParams 状态
        const params = { ...queryParams, ...customParams }
        return fetchApi(page.currentPage, page.pageSize, params)
      },
      // // body 对象： { removeRecords }
      // delete: ({ body }) => {
      //   console.log(body)
      //   return delApi(body.removeRecords)
      // },
      // // body 对象： { insertRecords, updateRecords, removeRecords, pendingRecords }
      // save: ({ body }) => {
      //   return saveApi(body.insertRecords)
      // }
    }
  },
  columns: [
    { type: 'checkbox', width: 40, align: 'center', fixed: 'left' },
    { type: 'seq', width: 40, align: 'center', fixed: 'left' },
    {
      field: 'name', title: 'Name', width: '25%',
      slots: {
        header: ({ column }) => {
          return (
            <CustomHeader
              title={column.title}
              type="input"
              onSearch={(val: string) => {
                if (val) {
                  console.log('Search Name:', val)
                  Message.success(`查询 Name: ${val}`)
                  // 更新查询参数状态
                  queryParams[column.field] = val
                  // 模拟后端查询逻辑，传递列信息和当前值
                  gridOptions.proxyConfig?.ajax?.query?.({ 
                    page: { currentPage: 1, pageSize: 100 },
                    // 额外传递的信息
                    columnInfo: column,
                    currentVal: val
                  })
                }
              }}
            />
          )
        }
      }
    },
    { field: 'nickname', title: 'Nickname', width: '25%' },
    {
      field: 'role',
      title: 'Role',
      width: '25%',
      formatter: formatOption,
      params: { optionlist: [{ value: '0', label: 'Develop' }, { value: '1', label: 'Admin' }] },
      // filters: [{ data: '' }],
      slots: {
        header: ({ column }) => {
          return (
            <CustomHeader
              title={column.title}
              type="select"
              options={column.params.optionlist}
              onSearch={(val: string) => {
                if (val) {
                  console.log('Search Role:', val)
                  Message.success(`查询 Role: ${val}`)
                  // 更新查询参数状态
                  queryParams[column.field] = val
                  // 模拟后端查询逻辑，传递列信息和当前值
                  gridOptions.proxyConfig?.ajax?.query?.({ 
                    page: { currentPage: 1, pageSize: 100 },
                    // 额外传递的信息
                    columnInfo: column,
                    currentVal: val
                  })
                }
              }}
            />
          )
        }
      }
    },
    { field: 'address', title: 'Address', width: '50%' }
  ]
})

const gridEvents: VxeGridListeners = {
  toolbarButtonClick (params: any) {
    console.log(params)
    switch (params.button.code) {
      case 'myAdd':
        Message.info(params.button.name)
        break
      case 'myDel': {
        const selectRecords = [
          ...params.$grid.getCheckboxReserveRecords(), // 保留选中的记录
          ...params.$grid.getCheckboxRecords() // 当前选中的记录
        ]
        if (selectRecords.length === 0) {
          Message.warning('请至少选择一条记录！')
          return
        }
        Modal.confirm({
          title: '提示',
          content: `确定删除选中 ${selectRecords.length} 项吗？`,
          onBeforeOk: async () => {
            await new Promise(resolve => setTimeout(resolve, 3000));
            return true;
          }
        });
        break
      }
      case 'mySave':
        Message.info(params.button.name)
        break
      case 'myDetail':
        Message.info(params.button.name)
        break
    }
  }
}

const [Grid, gridApi] = useKunkkaQueryGrid({ gridOptions, gridEvents });

</script>

<template>
  <div class="h-full w-full overflow-hidden">
    <div class="bg-blue-300 h-[60px] fixed top-0 left-0 right-0"></div>
    <div class="bg-green-300 h-[200px]"></div>
    <div class="relative sticky-father">
      <Grid>
        <template #header>123123</template>
      </Grid>
    </div>
    <div class="bg-green-300 h-[1000px]"></div>
  </div>
</template>