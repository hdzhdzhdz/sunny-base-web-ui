<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useSunnyEditGrid, EditRender, useSunnyModal } from '@sunny-base-web/ui';
import { getResourceByParIdOrModnumb, initResourceConstructor } from '@sunny-base-web/effects'
import type { VxeGridProps, VxeGridListeners } from 'vxe-table'
// @ts-ignore
import axios from 'axios';
const cModnumb = ref('95597ea3-a2f2-47cb-8b87-e5116b2b716d')
const token = ref('Bearer%20eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMTk4NTA3IiwiaXNzIjoiZWNoaXNhbiIsImV4cCI6MTc3Mjc1NzA5NiwiaWF0IjoxNzcyMTUyMjk2LCJyb2wiOlsiMSJdfQ.zw9JEzZgMViXCNMxekMsIRO7BOvsLmRaaIK39lHlPpzqOdsHbPydZrzxocpqSoKV2KI6FU33jPWMcnV5f1x9wg')

const gridOptions = reactive({
  id: 'ResourceUsage-demo',
  data: [],
  columns: [],
  border: true,
  size: 'mini',
  height: 400,
  editConfig: {
    enabled: true,
    trigger: 'click',
    mode: 'row'
  },
  columnConfig: {
    resizable: true,
  },
  customConfig: {
    storage: true
  }
} as any);

const gridEvents: VxeGridListeners = {
  toolbarButtonClick (params: any) {
    console.log(params)
    const selectRecords = [
      ...params.$grid.getCheckboxReserveRecords(), // 保留选中的记录
      ...params.$grid.getCheckboxRecords() // 当前选中的记录
    ]
    switch (params.button.code) {
      case 'add':
        gridApi.addEvent()
        break
      case 'del': {
        gridApi.deleteSelection()
        break
      }
    }
  }
}

const [ConnectedModal, { open }] = useSunnyModal();
const [Grid, gridApi] = useSunnyEditGrid({ gridOptions, gridEvents });
const handleOpen = () => {
  // getResourceByParIdOrModnumb({ modnumb: cModnumb.value }, {
  //   headers: {
  //     'Authorization': token.value
  //   }
  // })
  axios.post('https://basetest.pcloud.sunnyoptical.cn/base/test/core/contact/getCurrentUserResourcesByParId', {
    // parId: cModnumb.value
    modnumb: cModnumb.value,
    types: [2, 3]
  }, {
    headers: {
      'Authorization': token.value
    }
  }).then((res: any) => {
    const { resFieldList, resButtonList, resColumnList } = initResourceConstructor(res.data.result)
    gridOptions.columns = [
      {
        type: 'checkbox',
        width: '40',
        align: 'center',
        fixed: 'left',
        order: 0
      },
      ...resColumnList['table'],
    ]
    gridOptions.toolbarConfig = {
      zoom: true,
      custom: true,
      buttons: resButtonList['table']
    }
    gridApi.reloadData([])
    open();
  })
};
</script>

<template>
  <div class="vp-raw">
    <div class="flex mb-2 items-center">
      <span>模块编号：</span>
      <a-input v-model="cModnumb" class="w-[350px]" allow-clear />
    </div>
    <div class="flex mb-2 items-center">
      <span>token：</span>
      <a-textarea v-model="token" class="w-full" allow-clear />
    </div>
    <a-button type="primary" @click="handleOpen">打开弹窗</a-button>
    <ConnectedModal title="基础弹窗">
      <Grid>
        <!-- <template #toolbar>
          <a-button type="primary" @click="gridApi.addEvent()">添加</a-button>
          <a-button @click="gridApi.deleteSelection()">删除</a-button>
        </template> -->
      </Grid>
    </ConnectedModal>
  </div>
</template>
